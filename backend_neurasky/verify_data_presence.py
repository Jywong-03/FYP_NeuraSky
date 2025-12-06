import os
import django
from django.db.models import Count

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from api.models import TrackedFlight, FlightHistory
from django.contrib.auth.models import User

def verify_data():
    print("--- Verifying Data Presence ---")
    
    # Check User
    try:
        user = User.objects.get(username='justin')
        print(f"User 'justin' exists (ID: {user.id}).")
    except User.DoesNotExist:
        print("ERROR: User 'justin' does NOT exist.")
        return

    # Check Flights for User
    flight_count = TrackedFlight.objects.filter(user=user).count()
    print(f"TrackedFlight count for 'justin': {flight_count}")
    
    if flight_count > 0:
        flights = TrackedFlight.objects.filter(user=user).values('flight_number', 'origin', 'destination')
        for f in flights:
            print(f" - {f['flight_number']}: {f['origin']} -> {f['destination']}")
    
    # Check Stats that Dashboard uses
    # Dashboard typically uses: flightsTracked, delayAlerts, upcomingFlights
    
    # Check History (for Analytics pages)
    history_count = FlightHistory.objects.count()
    print(f"FlightHistory global count: {history_count}")
    
    if history_count == 0:
        print("WARNING: FlightHistory table is empty!")
    else:
        print("FlightHistory has data.")

if __name__ == '__main__':
    verify_data()
