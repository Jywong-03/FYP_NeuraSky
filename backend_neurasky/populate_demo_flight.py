import os
import django
from datetime import date, datetime, timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from api.models import TrackedFlight
from django.contrib.auth.models import User

def populate_demo_flight():
    # Get or create the user 'justin'
    try:
        user = User.objects.get(email='justin@gmail.com')
        print(f"Found user by email: {user.username}")
    except User.DoesNotExist:
        user, created = User.objects.get_or_create(username='justin')
        user.email = 'justin@gmail.com'
        user.set_password('justin')
        user.save()
        print(f"Created/Updated user: {user.username}")

    # Create a demo flight with Flighty-like details
    flight = TrackedFlight(
        user=user,
        flight_number='AA123',
        date=date.today(),
        status='On-Time',
        estimatedDelay=0,
        departureTime=timezone.now() + timedelta(hours=2),
        origin='JFK',
        destination='LHR',
        
        # New Flighty-like fields
        inbound_flight_number='AA122',
        inbound_origin='LAX',
        gate='B12',
        terminal='4',
        baggage_claim='5',
        aircraft_type='Boeing 777-300ER'
    )
    flight.save()
    print(f"Created demo flight: {flight}")

if __name__ == '__main__':
    populate_demo_flight()
