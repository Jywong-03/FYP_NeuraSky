from django.contrib.auth.models import User
from rest_framework import serializers

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