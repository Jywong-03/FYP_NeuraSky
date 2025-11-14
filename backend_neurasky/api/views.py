import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .serializers import RegisterSerializer,UserProfileSerializer,TrackedFlightSerializer
from .models import TrackedFlight

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