from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Stores flights saved by users from the 'MyFlights.jsx' page
class TrackedFlight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tracked_flights')
    flight_number = models.CharField(max_length=10)
    date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=50, null=True, blank=True)
    estimatedDelay = models.IntegerField(null=True, blank=True)
    departureTime = models.DateTimeField(null=True, blank=True)
    arrivalTime = models.DateTimeField(null=True, blank=True)
    airline = models.CharField(max_length=100, null=True, blank=True)
    
    origin = models.CharField(max_length=10, null=True, blank=True)
    destination = models.CharField(max_length=10, null=True, blank=True)

    # Flighty-like features
    inbound_flight_number = models.CharField(max_length=10, null=True, blank=True)
    inbound_origin = models.CharField(max_length=10, null=True, blank=True)
    gate = models.CharField(max_length=10, null=True, blank=True)
    terminal = models.CharField(max_length=10, null=True, blank=True)
    baggage_claim = models.CharField(max_length=10, null=True, blank=True)
    aircraft_type = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.flight_number} on {self.date}"
    
# Stores historical data for analytics
class FlightHistory(models.Model):
    flight_number = models.CharField(max_length=20)
    airline = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=50)
    delay_minutes = models.IntegerField(default=0)

    # CHANGED: Removed auto_now_add=True to allow importing historical data
    recorded_at = models.DateTimeField()

    def __str__(self):
        return f"{self.flight_number} on {self.recorded_at.date()} - Status: {self.status}"
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    emailNotifications = models.BooleanField(default=True)
    pushNotifications = models.BooleanField(default=True)
    delayAlerts = models.BooleanField(default=True)
    weeklyDigest = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# --- SIGNALS ---
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    else:
        instance.profile.save()

class Alert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="alerts")
    title = models.CharField(max_length=100)
    message = models.TextField()
    read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True) 
    type = models.CharField(max_length=50, default='info')
    severity = models.CharField(max_length=50, default='low')
    flightNumber = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    class Meta:
        ordering = ['-timestamp']