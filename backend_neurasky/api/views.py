import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .serializers import RegisterSerializer,UserProfileSerializer,TrackedFlightSerializer
from .models import TrackedFlight

import joblib
import pandas as pd
from django.conf import settings
import os
from .models import TrackedFlight, FlightHistory # Make sure FlightHistory is added
from django.db.models import Count, Avg
from django.db.models.functions import TruncMonth

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

# This creates the '/api/register/' endpoint
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Allows anyone (even not logged in) to register
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated] # Must be logged in

    def get_object(self):
        # Returns the user who is making the request
        return self.request.user
    
class TrackedFlightView(generics.ListCreateAPIView):
    serializer_class = TrackedFlightSerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users can see/add flights

    def get_queryset(self):
        # Only return flights that belong to the currently logged-in user
        return TrackedFlight.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user when a new flight is created
        serializer.save(user=self.request.user)

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