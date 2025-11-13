from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .serializers import RegisterSerializer

# This creates the '/api/register/' endpoint
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Allows anyone (even not logged in) to register
    serializer_class = RegisterSerializer