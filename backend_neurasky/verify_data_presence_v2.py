import os
import django
from django.db.models import Count

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from api.models import TrackedFlight, FlightHistory
from django.contrib.auth.models import User

def verify_data():
    print("--- Verifying Data Presence (By Email) ---")
    
    # Check User
    try:
        # Try finding by exact username first (as per list_users output)
        try:
            user = User.objects.get(username='justin@gmail.com')
        except User.DoesNotExist:
            user = User.objects.get(email='justin@gmail.com')
            
        print(f"User found! ID: {user.id}, Username: '{user.username}', Email: '{user.email}'")
        
        # Check Flights for User
        flight_count = TrackedFlight.objects.filter(user=user).count()
        print(f"TrackedFlight count for this user: {flight_count}")
        
        if flight_count > 0:
            flights = TrackedFlight.objects.filter(user=user).values('flight_number', 'origin', 'destination')
            for f in flights:
                print(f" - {f['flight_number']}: {f['origin']} -> {f['destination']}")
        else:
            print("WARNING: User exists but has NO tracked flights.")
            
    except User.DoesNotExist:
        print("ERROR: User with email 'justin@gmail.com' does NOT exist.")
    except User.MultipleObjectsReturned:
        print("ERROR: Multiple users with email 'justin@gmail.com' exist.")

if __name__ == '__main__':
    verify_data()
