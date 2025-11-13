from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .serializers import RegisterSerializer,UserProfileSerializer

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