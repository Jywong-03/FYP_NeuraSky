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
            'departureTime',
            'arrivalTime',
            'gate',
            'terminal',
            'baggage_claim',
            'aircraft_type',
            'airline'
        )
        
        # --- THIS IS THE FIX ---
        # We must also mark 'origin' and 'destination' as read-only,
        # just like the other fields populated by the server.
        read_only_fields = ('origin', 'destination', 'status', 'estimatedDelay', 'departureTime', 'arrivalTime', 'gate', 'terminal', 'baggage_claim', 'aircraft_type', 'airline')

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        # Define all the fields to send to the frontend
        fields = ['id', 'user', 'title', 'message', 'read', 'timestamp', 'type', 'severity', 'flightNumber']
        # We only want to read the user, not change it
        read_only_fields = ['user']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    def __init__(self, *args, **kwargs):
        """
        This __init__ method is the fix.
        It removes the default 'username' field and adds our 'email' field.
        """
        super().__init__(*args, **kwargs)
        
        # Add 'email' field
        self.fields['email'] = serializers.EmailField()
        
        # Remove the default 'username' field
        if 'username' in self.fields:
            del self.fields['username']

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return token

    def validate(self, attrs):
        # 'attrs' will now correctly contain {'email': '...', 'password': '...'}
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # We authenticate using the email as the username
            user = authenticate(request=self.context.get('request'),
                                username=email, password=password)
            
            # Fallback (in case username is not email, but this is good to have)
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

        # --- IMPORTANT ---
        # The 'super().validate()' call below requires 'attrs' to have the
        # 'username' key. We set it here after we've already authenticated.
        attrs['username'] = user.email
        
        # Now we call the parent's validate method
        return super().validate(attrs)