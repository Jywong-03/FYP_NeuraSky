from django.contrib.auth.models import User
from rest_framework import serializers
from .models import TrackedFlight, UserProfile

class UserProfileSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        # List the fields from your new model
        fields = (
            'emailNotifications', 
            'pushNotifications', 
            'delayAlerts', 
            'weeklyDigest'
        )

class UserProfileSerializer(serializers.ModelSerializer):
    # This renames 'date_joined' to 'memberSince' to match the frontend
    memberSince = serializers.DateTimeField(source='date_joined', read_only=True)
    
    # This creates a 'name' field from 'first_name' and 'last_name'
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        # These are the fields your frontend component needs
        fields = ['id', 'email', 'name', 'memberSince']

    def get_name(self, obj):
        # Combines first and last name, or just uses username as a fallback
        return obj.get_full_name() or obj.username

# This serializer is for your RegisterPage.jsx
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Your RegisterPage.jsx asks for "Full Name", which we'll save as 'first_name'.
        # We'll use the email as the 'username' for simplicity.
        fields = ('email', 'password', 'first_name')
        extra_kwargs = {'password': {'write_only': True}} # Makes password write-only

    def create(self, validated_data):
        # Use Django's create_user method to correctly hash the password
        user = User.objects.create_user(
            username=validated_data['email'], # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name']
        )
        return user
    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # These are the fields your frontend needs for the
        # UserProfile.jsx and Navigation.jsx components
        fields = ('id', 'username', 'email', 'first_name')

# In api/serializers.py

class TrackedFlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackedFlight
        
        # List ALL fields from your TrackedFlight model
        fields = (
            'id', 
            'flight_number', 
            'date', 
            'origin', 
            'destination', 
            'status', 
            'estimatedDelay', 
            'departureTime'
        )
        
        # Mark fields that are set by the server as 'read_only'.
        # The frontend will send flight_number, date, origin, and destination,
        # and the server will fill in the rest.
        read_only_fields = ('status', 'estimatedDelay', 'departureTime')