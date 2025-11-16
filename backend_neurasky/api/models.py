from django.db import models
from django.contrib.auth.models import User # Import Django's built-in User
from django.db.models.signals import post_save # --- Add these imports for the signal ---
from django.dispatch import receiver

# Stores flights saved by users from the 'MyFlights.jsx' page
class TrackedFlight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tracked_flights')
    flight_number = models.CharField(max_length=10)
    date = models.DateField(null=True, blank=True)
    
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
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    emailNotifications = models.BooleanField(default=True)
    pushNotifications = models.BooleanField(default=True)
    delayAlerts = models.BooleanField(default=True)
    weeklyDigest = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# --- NEW SIGNAL ---
# This function creates a UserProfile automatically when a new User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

# This function saves the profile when the user is saved
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # This check prevents it from crashing on existing users
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    else:
        instance.profile.save()