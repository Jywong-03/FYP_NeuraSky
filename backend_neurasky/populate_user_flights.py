import os
import django
from datetime import date, datetime, timedelta
import random
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from api.models import TrackedFlight
from django.contrib.auth.models import User

def populate_malaysia_flights():
    # Get or create the user 'justin'
    try:
        user = User.objects.get(email='justin@gmail.com')
        print(f"Found user: {user.username}")
    except User.DoesNotExist:
        user, created = User.objects.get_or_create(username='justin')
        user.email = 'justin@gmail.com'
        user.set_password('justin')
        user.save()
        print(f"Created user: {user.username}")

    # Clear existing demo flights for clarity (Optional, but good for demo cleanliness)
    # TrackedFlight.objects.filter(user=user).delete()
    
    flights_data = [
        {
            'flight_number': 'MH123',
            'origin': 'KUL', 'destination': 'PEN',
            'airline': 'Malaysia Airlines',
            'status': 'On-Time', 'delay': 0,
            'gate': 'H4', 'terminal': '1'
        },
        {
            'flight_number': 'AK5412',
            'origin': 'KUL', 'destination': 'BKI',
            'airline': 'AirAsia',
            'status': 'Delayed', 'delay': 45,
            'gate': 'J2', 'terminal': '2'
        },
        {
            'flight_number': 'OD2101',
            'origin': 'PEN', 'destination': 'SIN',
            'airline': 'Batik Air',
            'status': 'On-Time', 'delay': 0,
            'gate': 'G1', 'terminal': 'INT'
        },
        {
            'flight_number': 'MH2514',
            'origin': 'KCH', 'destination': 'KUL',
            'airline': 'Malaysia Airlines',
            'status': 'Arrived', 'delay': 0,
            'gate': 'A3', 'terminal': '1'
        },
        {
            'flight_number': 'AK6123',
            'origin': 'LHR', 'destination': 'KUL', # Long haul demo
            'airline': 'AirAsia X',
            'status': 'In-Air', 'delay': 0,
            'gate': 'C12', 'terminal': '2'
        },
        {
            'flight_number': 'FY230',
            'origin': 'SZB', 'destination': 'LGK',
            'airline': 'Firefly',
            'status': 'Scheduled', 'delay': 0,
            'gate': '1', 'terminal': 'Subang'
        }
    ]

    print(f"Creating {len(flights_data)} demo flights for Malaysia context...")

    for i, data in enumerate(flights_data):
        # Stagger dates slightly
        flight_date = date.today() + timedelta(days=random.randint(-1, 2))
        
        # Calculate times
        dep_time = timezone.now() + timedelta(hours=random.randint(1, 24))
        
        flight = TrackedFlight(
            user=user,
            flight_number=data['flight_number'],
            date=flight_date,
            status=data['status'],
            estimatedDelay=data['delay'],
            departureTime=dep_time,
            origin=data['origin'],
            destination=data['destination'],
            
            # Flighty-like details
            inbound_flight_number=f"IN{random.randint(100,999)}",
            inbound_origin='MIX',
            gate=data['gate'],
            terminal=data['terminal'],
            baggage_claim=str(random.randint(1, 10)),
            aircraft_type='Boeing 737-800' if 'MH' in data['flight_number'] else 'Airbus A320'
        )
        flight.save()
        print(f" - Added {data['flight_number']} ({data['origin']} -> {data['destination']})")

    print("Done! User dashboard populated.")

if __name__ == '__main__':
    populate_malaysia_flights()
