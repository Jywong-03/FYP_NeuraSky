import os
import requests
import joblib
import pandas as pd
import numpy as np

# Trigger Reload
import json
from datetime import datetime

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework import permissions
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Count, Avg
from django.db.models.functions import TruncMonth
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail

from .serializers import (
    RegisterSerializer, UserProfileSerializer, TrackedFlightSerializer, 
    UserProfileSettingsSerializer, AlertSerializer, MyTokenObtainPairSerializer
)
from .models import TrackedFlight, FlightHistory, UserProfile, Alert

# --- 1. LOAD THE ENHANCED MALAYSIA MODEL ---
MODEL_PATH = os.path.join(settings.BASE_DIR, 'api', 'flight_delay_model.joblib')
ENCODER_PATH = os.path.join(settings.BASE_DIR, 'api', 'flight_data_encoder.joblib')
FEATURES_PATH = os.path.join(settings.BASE_DIR, 'api', 'model_features.joblib')
METRICS_PATH = os.path.join(settings.BASE_DIR, 'api', 'training_metrics.joblib')

# Load model, encoder, and features when server starts
try:
    ML_MODEL = joblib.load(MODEL_PATH)
    DATA_ENCODER = joblib.load(ENCODER_PATH)
    FEATURE_NAMES = joblib.load(FEATURES_PATH)
    TRAINING_METRICS = joblib.load(METRICS_PATH)
    print(f"✅ Enhanced ML Model loaded successfully")
    print(f"📊 Model F1-Score: {TRAINING_METRICS.get('f1_score', 0):.4f}")
    features_len = len(FEATURE_NAMES) if FEATURE_NAMES else 0
    print(f"📈 Features used: {features_len}")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not load enhanced model. Error: {e}")
    ML_MODEL = None
    DATA_ENCODER = None
    FEATURE_NAMES = None
    TRAINING_METRICS = None

# --- RESTORED VIEWS ---

class UserProfileSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

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

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        user = request.user
        current_password = request.data.get('currentPassword')
        new_password = request.data.get('newPassword')
        if not user.check_password(current_password):
            return Response({"error": "Wrong password."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user

class TrackedFlightView(generics.ListCreateAPIView):
    serializer_class = TrackedFlightSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return TrackedFlight.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        import random
        from datetime import datetime, timedelta
        
        # AIRPORT_DATA for Simulation
        AIRPORTS = ['KUL', 'PEN', 'BKI', 'KCH', 'LGK', 'JHB', 'SIN', 'HKG', 'NRT', 'LHR', 'SYD']
        AIRLINES = {
            'MH': 'Malaysia Airlines', 'AK': 'AirAsia', 'OD': 'Batik Air', 
            'SQ': 'Singapore Airlines', 'CX': 'Cathay Pacific', 'JL': 'Japan Airlines'
        }
        
        user = self.request.user
        data = self.request.data
        
        # 1. Basic Info
        flight_number = data.get('flight_number', 'MH123').upper()
        force_delay = data.get('simulate_delay', False) # Check for boolean flag
        
        # 2. Simulate Route if missing
        origin = 'KUL' # Default origin
        possible_dests = [a for a in AIRPORTS if a != origin]
        destination = random.choice(possible_dests)
        
        # 3. Simulate Schedule
        # If date is not provided, use today. If provided, parse it.
        now = timezone.now()
        
        # Random departure hour (06:00 to 22:00)
        dep_hour = random.randint(6, 22) 
        dep_minute = random.choice([0, 15, 30, 45])
        departure_time = now.replace(hour=dep_hour, minute=dep_minute, second=0, microsecond=0)
        
        # Calculate Arrival Time (Approx duration based on distance)
        # We can reuse get_estimated_distance logic or just rough it: 1h for local, 4h international
        # For simplicity, let's map a few:
        duration_mins = 60 # Default to 1 hour (e.g. KUL-PEN)
        if destination in ['HKG', 'NRT', 'SYD', 'LHR', 'DXB']:
            duration_mins = 360 + random.randint(0, 300) # 6-11 hours
        elif destination in ['SIN', 'BKI', 'KCH']:
            duration_mins = 90 + random.randint(0, 30)
            
        arrival_time = departure_time + timedelta(minutes=duration_mins)
        
        # 4. Simulate Gate/Terminal
        terminal = random.choice(['1', '2'])
        gate_prefix = random.choice(['G', 'H', 'A', 'B'])
        gate_number = random.randint(1, 20)
        gate = f"{gate_prefix}{gate_number}"
        
        # 5. Simulate Status
        # 80% On Time, 15% Delayed, 5% Cancelled
        rand_val = random.random()
        
        if force_delay or rand_val < 0.15: # Forced delay OR natural random delay (shifted probability logic for presentation)
             # Actually let's keep original prob but override if force_delay is True
             pass

        if force_delay:
            status_val = "Delayed"
            delay = random.choice([45, 60, 90, 120, 180]) # Make it a significant delay
            reason = "Weather Conditions"
            arrival_time += timedelta(minutes=delay)
        elif rand_val < 0.80:
            status_val = "On Time"
            delay = 0
            reason = "Operational"
        elif rand_val < 0.95:
            status_val = "Delayed"
            delay = random.choice([15, 30, 45, 60, 90, 120])
            reason = random.choice(["Weather", "Technical", "Late Arrival"])
            arrival_time += timedelta(minutes=delay)
        else:
            status_val = "Cancelled"
            delay = 0
            reason = "Operational"
            
        # 6. Save
        tracked_flight = serializer.save(
            user=user,
            origin=origin,
            destination=destination,
            departureTime=departure_time,
            arrivalTime=arrival_time, 
            gate=gate,
            terminal=terminal,
            status=status_val,
            estimatedDelay=delay,
            baggage_claim=f"B{random.randint(1,10)}" if status_val != "Cancelled" else None,
            # Extract airline code for aircraft type logic
            aircraft_type = random.choice(['B737-800', 'A320neo', 'A330-300', 'B787-9']),
            airline = AIRLINES.get(flight_number[:2], "Unknown Airline") if flight_number[:2] in AIRLINES else random.choice(list(AIRLINES.values()))
        )
        
        # 7. Log History (Stats)
        FlightHistory.objects.create(
            flight_number=tracked_flight.flight_number,
            airline=tracked_flight.flight_number[:2],
            status=tracked_flight.status,
            delay_minutes=tracked_flight.estimatedDelay,
            recorded_at=timezone.now()
        )

class FlightStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, flight_number, date, *args, **kwargs):
        url = f"https://aerodatabox.p.rapidapi.com/flights/number/{flight_number}/{date}"
        headers = {
            "X-RapidAPI-Key": os.getenv('RAPIDAPI_KEY'), 
            "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com"
        }
        querystring = {"withAircraft":"true", "withLocation":"true"}
        try:
            response = requests.get(url, headers=headers, params=querystring)
            response.raise_for_status()
            data = response.json()
            if data and len(data) > 0:
                return Response(data[0])
            else:
                return Response({"error": "Flight not found"}, status=404)
        except requests.exceptions.HTTPError as err:
            return Response({"error": str(err)}, status=err.response.status_code)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class DelayReasonsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        status_counts = FlightHistory.objects.values('status').annotate(value=Count('id')).order_by('-value')
        formatted_data = []
        for item in status_counts:
            status_text = item['status']
            if not status_text:
                status_text = 'Unknown'
            clean_name = status_text.replace('-', ' ').capitalize()
            formatted_data.append({'name': clean_name, 'value': item['value']})
        return Response(formatted_data)

class DelayDurationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        flights = FlightHistory.objects.all()
        on_time = flights.filter(delay_minutes__lte=0).count()
        delay_1_30 = flights.filter(delay_minutes__gt=0, delay_minutes__lte=30).count()
        delay_30_60 = flights.filter(delay_minutes__gt=30, delay_minutes__lte=60).count()
        delay_60_plus = flights.filter(delay_minutes__gt=60).count()
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
        monthly_data = FlightHistory.objects.annotate(month=TruncMonth('recorded_at')).values('month').annotate(avgDelay=Avg('delay_minutes'), totalDelays=Count('id')).order_by('month')
        formatted_data = []
        for item in monthly_data:
            if item['month']:
                formatted_data.append({
                    "month": item['month'].strftime('%Y-%m'),
                    "avgDelay": round(item['avgDelay'] or 0, 1),
                    "totalDelays": item['totalDelays']
                })
        return Response(formatted_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flight_stats_view(request):
    user = request.user
    now = timezone.now()
    flights_tracked = TrackedFlight.objects.filter(user=user).count()
    delay_alerts = TrackedFlight.objects.filter(user=user, estimatedDelay__gt=0).count()
    upcoming_flights = TrackedFlight.objects.filter(user=user, departureTime__gte=now).count()
    stats_data = {'flightsTracked': flights_tracked, 'delayAlerts': delay_alerts, 'upcomingFlights': upcoming_flights}
    return Response(stats_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_alerts(request):
    alerts = Alert.objects.filter(user=request.user).order_by('-timestamp')
    serializer = AlertSerializer(alerts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_new_alerts(request):
    since_id = request.query_params.get('since', 0)
    user_flights = TrackedFlight.objects.filter(user=request.user)
    for flight in user_flights:
        if flight.estimatedDelay and flight.estimatedDelay > 15:
            already_alerted = Alert.objects.filter(user=request.user, flightNumber=flight.flight_number, type='delay').exists()
            if not already_alerted:
                # Create Alert
                alert = Alert.objects.create(
                    user=request.user,
                    title=f"Flight {flight.flight_number} Delayed",
                    message=f"Your flight to {flight.destination} is delayed by {flight.estimatedDelay} minutes.",
                    type='delay',
                    severity='high',
                    flightNumber=flight.flight_number
                )
                
                # Send Email if enabled
                try:
                    if hasattr(request.user, 'profile') and request.user.profile.emailNotifications:
                        send_mail(
                            subject=f"⚠️ Flight Delay Alert: {flight.flight_number}",
                            message=f"Dear {request.user.username},\n\nYour flight {flight.flight_number} to {flight.destination} is currently delayed by {flight.estimatedDelay} minutes.\n\nPlease check the dashboard for more details.\n\nSafe travels,\nNeuraSky Team",
                            from_email=None, # Uses DEFAULT_FROM_EMAIL
                            recipient_list=[request.user.email],
                            fail_silently=True,
                        )
                        print(f"📧 Email sent to {request.user.email}")
                except Exception as e:
                    print(f"Failed to send email: {e}")

    alerts = Alert.objects.filter(user=request.user, id__gt=since_id).order_by('-timestamp')
    serializer = AlertSerializer(alerts, many=True)
    return Response(serializer.data)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_alerts_read(request):
    Alert.objects.filter(user=request.user, read=False).update(read=True)
    return Response(status=status.HTTP_204_NO_CONTENT)

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
        return TrackedFlight.objects.filter(user=self.request.user)

# --- 2. ENHANCED PREDICTION LOGIC ---

# Helper to estimate distance
def get_estimated_distance(origin, dest):
    distances = {
        ('KUL', 'PEN'): 325, ('PEN', 'KUL'): 325,
        ('KUL', 'BKI'): 1630, ('BKI', 'KUL'): 1630,
        ('KUL', 'KCH'): 975, ('KCH', 'KUL'): 975,
        ('KUL', 'LGK'): 300, ('LGK', 'KUL'): 300,
        ('KUL', 'JHB'): 280, ('JHB', 'KUL'): 280,
        ('KUL', 'AOR'): 650, ('AOR', 'KUL'): 650,
        ('KUL', 'MYY'): 1150, ('MYY', 'KUL'): 1150,
        ('PEN', 'BKI'): 1350, ('BKI', 'PEN'): 1350,
        ('PEN', 'KCH'): 750, ('KCH', 'PEN'): 750,
        ('KUL', 'SIN'): 296, ('SIN', 'KUL'): 296,
        ('KUL', 'BKK'): 1220, ('BKK', 'KUL'): 1220,
        ('KUL', 'HKG'): 2560, ('HKG', 'KUL'): 2560,
        ('KUL', 'NRT'): 5320, ('NRT', 'KUL'): 5320,
        ('KUL', 'ICN'): 4620, ('ICN', 'KUL'): 4620,
        ('KUL', 'LHR'): 10600, ('LHR', 'KUL'): 10600,
        ('KUL', 'SYD'): 6530, ('SYD', 'KUL'): 6530,
        ('KUL', 'DXB'): 5550, ('DXB', 'KUL'): 5550,
        ('KUL', 'DOH'): 5630, ('DOH', 'KUL'): 5630,
    }
    return distances.get((origin, dest), 800)

def is_international_route(origin, dest):
    malaysian_airports = {'KUL', 'PEN', 'BKI', 'KCH', 'LGK', 'JHB', 'AOR', 'MYY', 'SDK', 'TWU'}
    return (origin not in malaysian_airports) or (dest not in malaysian_airports)

def get_time_of_day(hour):
    if 0 <= hour < 6: return 'Night'
    elif 6 <= hour < 12: return 'Morning'
    elif 12 <= hour < 18: return 'Afternoon'
    else: return 'Evening'

def is_peak_hour(hour):
    return hour in [7, 8, 9, 17, 18, 19, 20]

class RouteForecastView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        if not all([ML_MODEL, DATA_ENCODER, FEATURE_NAMES]):
            return Response({'error': 'Model not initialized'}, status=503)

        origin = request.data.get('origin')
        destination = request.data.get('destination')
        airline = request.data.get('airline', 'MH') # Default to MH if not specified

        if not origin or not destination:
            return Response({'error': 'Origin and Destination are required'}, status=400)

        forecast = []
        now = datetime.now()
        
        # We'll forecast every 2 hours for the next 24 hours
        for i in range(0, 25, 2):
            forecast_time = now + pd.Timedelta(hours=i)
            hour = forecast_time.hour
            month = forecast_time.month
            day_of_week = forecast_time.isoweekday()
            
            # Prepare Input Data
            distance = get_estimated_distance(origin, destination)
            crs_dep_time = hour * 100
            
            input_data = pd.DataFrame([{
                'Month': month,
                'DayOfWeek': day_of_week,
                'CRSDepTime': crs_dep_time,
                'Operating_Airline': airline,
                'Origin': origin,
                'Dest': destination,
                'Distance': distance,
                'Hour': hour,
                'IsInternational': int(is_international_route(origin, destination)),
                'IsPeakHour': int(is_peak_hour(hour)),
                'IsWeekend': int(day_of_week in [6, 7]),
                'TimeOfDay': get_time_of_day(hour)
            }])
            
            # Transform Features
            categorical_cols = ['Operating_Airline', 'Origin', 'Dest', 'TimeOfDay']
            try:
                input_data[categorical_cols] = DATA_ENCODER.transform(input_data[categorical_cols])
            except:
                # Fallback if unknown route/airport code
                continue

            for feature in FEATURE_NAMES:
                if feature not in input_data.columns:
                    input_data[feature] = 0
            
            input_data = input_data[FEATURE_NAMES]
            
            # Predict
            prob = ML_MODEL.predict_proba(input_data)[0][1] # Probability of delay
            
            forecast.append({
                'time': forecast_time.strftime('%H:%M'),
                'display_time': forecast_time.strftime('%I %p'), # 08 PM
                'probability': round(prob * 100, 1),
                'risk_level': 'High' if prob > 0.6 else 'Medium' if prob > 0.3 else 'Low'
            })
            
        return Response({
            'origin': origin,
            'destination': destination,
            'forecast': forecast
        })


@csrf_exempt
def predict_delay(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method. Use POST'}, status=405)

    if not all([ML_MODEL, DATA_ENCODER, FEATURE_NAMES]):
        return JsonResponse({'error': 'Enhanced model not trained. Server cannot predict.', 'message': 'Please run "python train_model_enhanced.py" first'}, status=500)
    
    try:
        data = json.loads(request.body)
        origin = data.get('origin')
        destination = data.get('destination')
        airline = data.get('airline', 'MH')
        flight_number = data.get('flight_number', '')
        
        # Parse scheduled departure time
        departure_time_str = data.get('departure_time', '')
        if departure_time_str:
            try:
                dep_hour, dep_minute = map(int, departure_time_str.split(':'))
                now = datetime.now()
                # Use current date but user-provided time
                current_time = now.replace(hour=dep_hour, minute=dep_minute)
            except ValueError:
                current_time = datetime.now()
        else:
            current_time = datetime.now()

        month = current_time.month
        day_of_week = current_time.isoweekday()
        current_hour = current_time.hour
        current_minute = current_time.minute
        crs_dep_time = current_hour * 100 + current_minute

        distance = get_estimated_distance(origin, destination)
        time_of_day = get_time_of_day(current_hour)
        is_international = is_international_route(origin, destination)
        is_peak_bool = is_peak_hour(current_hour)
        is_weekend = day_of_week in [6, 7]
        
        # Calculate Flight Duration (approx 800km/h + 30m taxi)
        flight_duration_mins = int((distance / 800 * 60) + 30)

        input_data = pd.DataFrame([{
            'Month': month,
            'DayOfWeek': day_of_week,
            'CRSDepTime': crs_dep_time,
            'Operating_Airline': airline,
            'Origin': origin,
            'Dest': destination,
            'Distance': distance,
            'Hour': current_hour,
            'IsInternational': int(is_international),\
            'IsPeakHour': int(is_peak_bool),
            'IsWeekend': int(is_weekend),
            'TimeOfDay': time_of_day
        }])

        categorical_cols = ['Operating_Airline', 'Origin', 'Dest', 'TimeOfDay']
        input_data[categorical_cols] = DATA_ENCODER.transform(input_data[categorical_cols])

        for feature in FEATURE_NAMES:
            if feature not in input_data.columns:
                input_data[feature] = 0
        
        input_data = input_data[FEATURE_NAMES]

        prediction_class = ML_MODEL.predict(input_data)[0]
        prediction_prob = ML_MODEL.predict_proba(input_data)[0]

        is_delayed = (prediction_class == 1)
        confidence_delayed = prediction_prob[1]
        confidence_ontime = prediction_prob[0]
        
        # Calculate Mock Rates for UI (In real app, query DB)
        # Base rates
        route_base = 15.0 
        airline_base = 18.0
        
        # Adjust based on risk factors
        if is_peak_bool: route_base += 10
        if is_international: route_base += 5
        if airline in ['AK', 'OD']: airline_base += 12
        
        route_delay_rate = min(95.0, route_base + (confidence_delayed * 20))
        airline_delay_rate = min(95.0, airline_base + (confidence_delayed * 15))

        if is_delayed:
            # Fix: Use a realistic base delay (e.g., 45 mins) instead of class count
            base_delay = 45 
            estimated_delay = int(confidence_delayed * base_delay * 1.5)
            # Ensure estimated delay is at least 15 mins
            estimated_delay = max(15, estimated_delay)
        else:
            estimated_delay = 0

        if confidence_delayed >= 0.7:
            risk_level = "High"
            reason = "Multiple risk factors detected"
        elif confidence_delayed >= 0.4:
            risk_level = "Medium"
            reason = "Moderate delay probability"
        else:
            risk_level = "Low"
            reason = "Optimal conditions expected"

        factors = []
        if is_peak_bool: factors.append("Peak hour traffic")
        if is_international: factors.append("International flight complexity")
        if is_weekend: factors.append("Weekend operations")
        if month in [12, 1, 6, 7, 8]: factors.append("Holiday season traffic")
        
        if factors:
            reason += f" ({', '.join(factors)})"

        response_data = {
            'flight_number': flight_number,
            'route': f"{origin} → {destination}",
            'airline': airline,
            'prediction': "Delayed" if is_delayed else "On Time",
            'confidence_delayed': f"{confidence_delayed * 100:.0f}%",
            'confidence_ontime': f"{confidence_ontime * 100:.0f}%",
            'risk_level': risk_level,
            'estimated_delay_minutes': estimated_delay,
            'reason': reason,
            'factors': factors,
            'distance_km': distance,
            'departure_time': f"{current_hour:02d}:{current_minute:02d}",
            'is_international': is_international,
            'is_peak_hour': is_peak_bool,
            'detailed_metrics': {
                'route_delay_rate': f"{route_delay_rate:.1f}%",
                'airline_delay_rate': f"{airline_delay_rate:.1f}%",
                'flight_duration_mins': flight_duration_mins,
                'departure_hour': current_hour
            },
            'model_info': {
                'f1_score': f"{TRAINING_METRICS['f1_score']:.4f}" if TRAINING_METRICS else "N/A",
                'recall': f"{TRAINING_METRICS['recall']:.4f}" if TRAINING_METRICS else "N/A",
                'accuracy': f"{TRAINING_METRICS['accuracy']:.4f}" if TRAINING_METRICS else "N/A",
                'training_date': TRAINING_METRICS.get('training_date', 'Unknown') if TRAINING_METRICS else "Unknown"
            },
            'origin_weather': {'condition': 'AI-Analyzed', 'temp': 'Processed'},
            'dest_weather': {'condition': 'AI-Analyzed', 'temp': 'Processed'}
        }
        return JsonResponse(response_data)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return JsonResponse({'error': f'Prediction failed: {str(e)}', 'message': 'Please check your input data and try again'}, status=500)

@csrf_exempt
def model_info(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method. Use GET'}, status=405)
    
    if not TRAINING_METRICS:
        return JsonResponse({'error': 'Model information not available'}, status=404)
    
    try:
        data = {
            'model_type': 'LightGBM Classifier',
            'training_date': TRAINING_METRICS.get('training_date'),
            'dataset_size': TRAINING_METRICS.get('dataset_size'),
            'performance': {
                'accuracy': f"{TRAINING_METRICS['accuracy']:.4f}",
                'precision': f"{TRAINING_METRICS['precision']:.4f}",
                'recall': f"{TRAINING_METRICS['recall']:.4f}",
                'f1_score': f"{TRAINING_METRICS['f1_score']:.4f}",
                'roc_auc': f"{TRAINING_METRICS['roc_auc']:.4f}"
            },
            'class_distribution': TRAINING_METRICS.get('class_distribution'),
            'features_used': len(FEATURE_NAMES) if FEATURE_NAMES else 0,
            'feature_importance': TRAINING_METRICS.get('feature_importance', {}).get('importance', {})
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': f'Failed to get model info: {str(e)}'}, status=500)