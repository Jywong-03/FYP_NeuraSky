from django.db import models
from django.contrib.auth.models import User # Import Django's built-in User

# Stores flights saved by users from the 'MyFlights.jsx' page
class TrackedFlight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    flight_number = models.CharField(max_length=20)
    airline = models.CharField(max_length=100)
    origin = models.CharField(max_length=50)
    destination = models.CharField(max_length=50)
    departure_time = models.DateTimeField()

    def __str__(self):
        return f"{self.user.username} - {self.flight_number}"

# You can add your other models here later (like Alert, AccountSettings, etc.)