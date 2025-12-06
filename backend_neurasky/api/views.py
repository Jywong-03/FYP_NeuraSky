import os
import requests
import joblib
import pandas as pd
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework import permissions
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Count, Avg
from django.db.models.functions import TruncMonth
from .serializers import RegisterSerializer,UserProfileSerializer,TrackedFlightSerializer, UserProfileSettingsSerializer, UserProfileSerializer, AlertSerializer, MyTokenObtainPairSerializer
from .models import TrackedFlight, FlightHistory, UserProfile, Alert

# Load the ML model and encoder when the server starts
MODEL_PATH = os.path.join(settings.BASE_DIR, 'api', 'flight_delay_model.joblib')
ENCODER_PATH = os.path.join(settings.BASE_DIR, 'api', 'flight_data_encoder.joblib')

try:
    ML_MODEL = joblib.load(MODEL_PATH)
    DATA_ENCODER = joblib.load(ENCODER_PATH)
    print("------------------------------------------")
    print("ML Model and Encoder loaded successfully.")
    print("------------------------------------------")
except FileNotFoundError:
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print("WARNING: Model files not found. Prediction API will not work.")
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    ML_MODEL = None
    DATA_ENCODER = None

# --- NEW VIEW FOR GETTING/UPDATING SETTINGS ---
class UserProfileSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # This view now GETS or CREATES the profile
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
# --- NEW VIEW FOR DELETING A USER ---
class DeleteUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = self.request.user
        try:
            user.delete()
            return Response({"message": "Account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

# This creates the '/api/register/' endpoint
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Allows anyone (even not logged in) to register
    serializer_class = RegisterSerializer

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        current_password = request.data.get('currentPassword')
        new_password = request.data.get('newPassword')

        if not user.check_password(current_password):
            return Response({"error": "Wrong password."}, status=status.HTTP_400_BAD_REQUEST)

        # You can add password validation here (e.g., length)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated] # Must be logged in

    def get_object(self):
        # Returns the user who is making the request
        return self.request.user
    
class TrackedFlightView(generics.ListCreateAPIView):
    serializer_class = TrackedFlightSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return flights that belong to the currently logged-in user
        return TrackedFlight.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # 1. Save the basic info
        tracked_flight = serializer.save(user=self.request.user)

        # 2. Simulate User Input / Default Values if missing
        # Since we are "Simulating", we trust the user input or defaults
        if not tracked_flight.status:
            tracked_flight.status = "Scheduled"
        
        if not tracked_flight.estimatedDelay:
            tracked_flight.estimatedDelay = 0
            
        tracked_flight.save()

        # 3. Create a history entry (optional, but good for consistency)
        FlightHistory.objects.create(
            flight_number=tracked_flight.flight_number,
            airline=tracked_flight.flight_number[:2], # Heuristic
            status=tracked_flight.status,
            delay_minutes=tracked_flight.estimatedDelay,
            recorded_at=timezone.now()
        )

class FlightStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, flight_number, date, *args, **kwargs):
        url = f"https://aerodatabox.p.rapidapi.com/flights/number/{flight_number}/{date}"

        headers = {
            # Get the key safely from your settings
            "X-RapidAPI-Key": os.getenv('RAPIDAPI_KEY'), 
            "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com"
        }

        # Add ?withAircraft=true&withLocation=true to get more details
        querystring = {"withAircraft":"true", "withLocation":"true"}

        try:
            # Make the request to the external API
            response = requests.get(url, headers=headers, params=querystring)
            response.raise_for_status()  # Raises an error for bad responses (4xx, 5xx)

            data = response.json()

            # The data from this API is in an array, we'll take the first result
            if data and len(data) > 0:
                return Response(data[0])
            else:
                return Response({"error": "Flight not found"}, status=404)

        except requests.exceptions.HTTPError as err:
            # Handle API errors (e.g., flight not found, auth error)
            return Response({"error": str(err)}, status=err.response.status_code)
        except Exception as e:
            # Handle other errors (e.g., network issue)
            return Response({"error": str(e)}, status=500)
        
# /api/predict/
class PredictionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        if not ML_MODEL or not DATA_ENCODER:
            return Response({"error": "Prediction model is not loaded."}, status=500)

        try:
            # 1. Get data from the frontend request
            #    e.g., {"Month": 10, "DayOfWeek": 3, "CRSDepTime": 1530, "Operating_Airline": "AA", "Origin": "JFK", "Dest": "LAX", "Distance": 2475}
            input_data = request.data
            
            # 2. Define the feature names in the *exact* order from training
            features = [
                'Month',
                'DayOfWeek',
                'CRSDepTime',
                'Operating_Airline',
                'Origin',
                'Dest',
                'Distance' # We added this in the final notebook
            ]
            
            # 3. Convert to DataFrame
            input_df = pd.DataFrame([input_data], columns=features)
            
            # 4. Define which columns are categorical
            categorical_features = ['Operating_Airline', 'Origin', 'Dest']
            
            # 5. Use your loaded encoder to transform the new data
            input_df[categorical_features] = DATA_ENCODER.transform(input_df[categorical_features])
            
            # 6. Make the real prediction
            prediction = ML_MODEL.predict(input_df)
            prediction_proba = ML_MODEL.predict_proba(input_df)
            
            # 7. Format the response
            is_delayed = int(prediction[0]) # Make sure it's an integer
            confidence_percent = prediction_proba[0][is_delayed] * 100

            return Response({
                "prediction": "Delayed" if is_delayed == 1 else "On-Time",
                "confidence": f"{confidence_percent:.0f}%"
            })

        except Exception as e:
            return Response({"error": f"An error occurred during prediction: {str(e)}"}, status=400)
        
class DelayReasonsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Query the FlightHistory database for global stats
        status_counts = FlightHistory.objects.values('status') \
                                             .annotate(value=Count('id')) \
                                             .order_by('-value')

        # Format the data for the pie chart
        formatted_data = []
        for item in status_counts:
            status = item['status']
            if not status:
                status = 'Unknown'

            # Capitalize first letter, replace '-'
            clean_name = status.replace('-', ' ').capitalize()

            formatted_data.append({
                'name': clean_name,
                'value': item['value']
            })

        return Response(formatted_data)
    
class DelayDurationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Use FlightHistory for global duration stats
        flights = FlightHistory.objects.all()

        # Initialize the buckets
        duration_data = {
            "On-Time": 0,
            "1-30 min": 0,
            "30-60 min": 0,
            "60+ min": 0,
        }

        # We can optimize this with database aggregation, but for now iteration is fine for 100k rows
        # Or better, let's use aggregation for performance
        
        on_time = flights.filter(delay_minutes__lte=0).count()
        delay_1_30 = flights.filter(delay_minutes__gt=0, delay_minutes__lte=30).count()
        delay_30_60 = flights.filter(delay_minutes__gt=30, delay_minutes__lte=60).count()
        delay_60_plus = flights.filter(delay_minutes__gt=60).count()

        # Format as a list of objects for the chart
        formatted_data = [
            {"range": "On-Time", "flights": on_time},
            {"range": "1-30 min", "flights": delay_1_30},
            {"range": "30-60 min", "flights": delay_30_60},
            {"range": "60+ min", "flights": delay_60_plus},
        ]

        return Response(formatted_data)
    
class HistoricalTrendsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Query FlightHistory for global trends
        # We group by month of 'recorded_at'
        monthly_data = FlightHistory.objects.annotate(
            month=TruncMonth('recorded_at')
        ).values('month').annotate(
            avgDelay=Avg('delay_minutes'),
            totalDelays=Count('id')
        ).order_by('month')

        # Format for the frontend
        formatted_data = []
        for item in monthly_data:
            if item['month']: # Ensure month is not None
                formatted_data.append({
                    "month": item['month'].strftime('%Y-%m'),
                    "avgDelay": round(item['avgDelay'] or 0, 1),
                    "totalDelays": item['totalDelays']
                })

        return Response(formatted_data)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    # Because of @permission_classes([IsAuthenticated]),
    # 'request.user' will be the logged-in user.
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flight_stats_view(request):
    user = request.user
    now = timezone.now() # Get the current time once

    # 1. Total flights tracked (ALL flights)
    flights_tracked = TrackedFlight.objects.filter(
        user=user
    ).count()
    
    # 2. Delay alerts (e.g., any tracked flight with a delay > 0)
    delay_alerts = TrackedFlight.objects.filter(
        user=user,
        estimatedDelay__gt=0
    ).count()
    
    # 3. Upcoming flights
    upcoming_flights = TrackedFlight.objects.filter(
        user=user,
        departureTime__gte=now
    ).count()
    
    # 4. Assemble the data into a dictionary
    stats_data = {
        'flightsTracked': flights_tracked,
        'delayAlerts': delay_alerts,
        'upcomingFlights': upcoming_flights
    }
    
    return Response(stats_data)

# 1. GET /api/alerts/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_alerts(request):
    alerts = Alert.objects.filter(user=request.user).order_by('-timestamp')
    serializer = AlertSerializer(alerts, many=True)
    return Response(serializer.data)

# 2. GET /api/alerts/new/
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_new_alerts(request):
    # Get the ID of the latest alert the user has
    # The frontend sends this as a query parameter: ?since=123
    since_id = request.query_params.get('since', 0)
    
    # --- LAZY ALERT GENERATION ---
    # Check for delayed flights and generate alerts if they don't exist
    user_flights = TrackedFlight.objects.filter(user=request.user)
    for flight in user_flights:
        # If delay is significant (> 15 mins)
        if flight.estimatedDelay and flight.estimatedDelay > 15:
            # Check if we already alerted for this specific flight
            # We use flight_number and date to be specific
            already_alerted = Alert.objects.filter(
                user=request.user,
                flightNumber=flight.flight_number,
                type='delay',
                # You might want to add a date check here too if you store it in Alert
                # For now, we assume one active alert per flight number is enough
            ).exists()
            
            if not already_alerted:
                Alert.objects.create(
                    user=request.user,
                    title=f"Flight {flight.flight_number} Delayed",
                    message=f"Your flight to {flight.destination} is delayed by {flight.estimatedDelay} minutes.",
                    type='delay',
                    severity='high',
                    flightNumber=flight.flight_number
                )
    
    alerts = Alert.objects.filter(
        user=request.user,
        id__gt=since_id  # Get all alerts with an ID greater than the one user has
    ).order_by('-timestamp')
    
    serializer = AlertSerializer(alerts, many=True)
    return Response(serializer.data)

# 3. POST /api/alerts/mark-read/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_alert_read(request):
    alert_id = request.data.get('id')
    try:
        alert = Alert.objects.get(id=alert_id, user=request.user)
        alert.read = True
        alert.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Alert.DoesNotExist:
        return Response({"error": "Alert not found"}, status=status.HTTP_404_NOT_FOUND)

# 4. POST /api/alerts/mark-all-read/
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_alerts_read(request):
    Alert.objects.filter(user=request.user, read=False).update(read=True)
    return Response(status=status.HTTP_204_NO_CONTENT)

# 5. DELETE /api/alerts/delete/
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_alert(request):
    alert_id = request.data.get('id')
    try:
        alert = Alert.objects.get(id=alert_id, user=request.user)
        alert.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Alert.DoesNotExist:
        return Response({"error": "Alert not found"}, status=status.HTTP_404_NOT_FOUND)
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class TrackedFlightDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TrackedFlightSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only allow the user to see/delete their *own* flights
        return TrackedFlight.objects.filter(user=self.request.user)