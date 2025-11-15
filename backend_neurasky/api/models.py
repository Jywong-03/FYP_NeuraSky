from django.db import models
from django.contrib.auth.models import User # Import Django's built-in User

# Stores flights saved by users from the 'MyFlights.jsx' page
class TrackedFlight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tracked_flights')
    flight_number = models.CharField(max_length=10)
    date = models.DateField()
    
    # --- ADD/CHECK THESE FIELDS ---
    # These will be filled in by the API
    status = models.CharField(max_length=50, null=True, blank=True)
    estimatedDelay = models.IntegerField(null=True, blank=True)
    departureTime = models.DateTimeField(null=True, blank=True)
    
    # Add other fields you want to save
    origin = models.CharField(max_length=10, null=True, blank=True)
    destination = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.flight_number} on {self.date}"
    
# Stores historical data for analytics
class FlightHistory(models.Model):
    flight_number = models.CharField(max_length=20)
    airline = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=50)
    delay_minutes = models.IntegerField(default=0)

    # We can add more fields later if we want (e.g., delay_reason)

    # This will automatically add the date and time when we save a record
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.flight_number} on {self.recorded_at.date()} - Status: {self.status}"