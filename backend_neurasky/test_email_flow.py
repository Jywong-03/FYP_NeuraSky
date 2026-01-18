import os
import django
import sys
from datetime import timedelta

# Setup Django Environment
sys.path.append(os.getcwd())
# Setup Django Environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')

# PATCH SETTINGS TO USE SQLITE (To avoid mysqlclient issues during test)
import neurasky_backend.settings as settings
settings.DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'test_db.sqlite3',
    }
}

django.setup()

# Ensure migrations are run for SQLite
from django.core.management import call_command
call_command('migrate', verbosity=0) # Run migrations silently

from django.contrib.auth.models import User
from django.utils import timezone
from api.models import TrackedFlight, Alert
from api.views import get_new_alerts
from django.test import RequestFactory
from rest_framework.request import Request

def run_test():
    print("--- Starting Email Logic Test ---")
    
    # 1. Setup User
    username = "test_user_demo"
    email = "test@neurasky.com"
    user, created = User.objects.get_or_create(username=username, email=email)
    print(f"User: {user.username}")

    # 2. Cleanup Previous Test Data
    TrackedFlight.objects.filter(user=user).delete()
    Alert.objects.filter(user=user).delete()
    print("Cleaned up old data.")

    # 3. Create Flight (Simulate 'TrackedFlightView')
    flight_number = "TEST999"
    print(f"Creating Flight {flight_number} with simulated delay...")
    
    flight = TrackedFlight.objects.create(
        user=user,
        flight_number=flight_number,
        origin="KUL",
        destination="LHR",
        status="Delayed",
        estimatedDelay=45, # > 15 mins
        departureTime=timezone.now() + timedelta(hours=4),
        arrivalTime=timezone.now() + timedelta(hours=15),
    )
    
    # 4. Explicitly delete alerts (as per View logic)
    Alert.objects.filter(user=user, flightNumber=flight_number).delete()

    # 5. Run Alert Check (Simulate 'get_new_alerts')
    print("Triggering get_new_alerts...")
    
    # Mock Request
    factory = RequestFactory()
    request = factory.get('/api/alerts/new/')
    request.user = user
    request.query_params = {}
    
    # Wrap in DRF Request
    drf_request = Request(request)
    
    # Call the view function directly (bypassing decorator overhead if possible, but calling wrapper is safer)
    # Since it's an @api_view, we call it like a view
    response = get_new_alerts(request) # api_view wrapper handles the request
    
    # 6. Verify Results
    print(f"Response Status: {response.status_code}")
    
    alerts = Alert.objects.filter(user=user, flightNumber=flight_number)
    print(f"Alerts Found: {alerts.count()}")
    
    if alerts.exists():
        alert = alerts.first()
        print(f"Alert Details: {alert.title} | {alert.timestamp}")
        print("✅ Alert Created Successfully.")
    else:
        print("❌ Alert NOT Created.")

    # 7. Test Re-Run (Simulate clicking it again)
    print("\n--- Testing Re-Run (Loop) ---")
    # Simulate View: Delete alerts first
    Alert.objects.filter(user=user, flightNumber=flight_number).delete()
    print("Deleted old alerts (simulating new track request).")
    
    # Run Alert Check again
    get_new_alerts(request)
    
    alerts_2 = Alert.objects.filter(user=user, flightNumber=flight_number)
    if alerts_2.exists():
         print("✅ Alert Re-Created Successfully (Fix Verified).")
    else:
         print("❌ Alert Failed to Re-Create.")

if __name__ == "__main__":
    run_test()
