from django.contrib.auth.models import User
from rest_framework import serializers
from .models import TrackedFlight, UserProfile, Alert
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

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

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        # Define all the fields to send to the frontend
        fields = ['id', 'user', 'title', 'message', 'read', 'timestamp', 'type', 'severity', 'flightNumber']
        # We only want to read the user, not change it
        read_only_fields = ['user']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # You could add custom claims to the token here if you wanted
        # token['name'] = user.get_full_name()
        return token

    def validate(self, attrs):
        # The default validator uses 'username'. We override it
        # to use 'email' instead.
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Try to authenticate with the email
            user = authenticate(request=self.context.get('request'),
                                username=email, password=password)
            
            # If that fails, it's possible the user's email isn't their username
            # So, we also try finding the user by email first
            if not user:
                try:
                    user_by_email = User.objects.get(email=email)
                    if user_by_email.check_password(password):
                        user = user_by_email
                except User.DoesNotExist:
                    pass

            if not user:
                raise serializers.ValidationError('No active account found with the given credentials')

        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        # The 'attrs' dict passed to the parent must have the 'username'
        # key, so we set it to the user's email.
        attrs['username'] = user.email
        return super().validate(attrs)