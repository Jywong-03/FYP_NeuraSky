import os
import django
from datetime import date, datetime

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.test import APIClient
from api.models import TrackedFlight, Alert

def verify_alerts():
    print("Starting alert verification...")
    
    # 1. Create Test User
    username = 'test_alert_user'
    user, created = User.objects.get_or_create(username=username)
    if created:
        user.set_password('password')
        user.save()
        print(f"Created test user: {username}")
    else:
        print(f"Using existing test user: {username}")

    # 2. Create a Delayed Tracked Flight
    flight_number = 'TEST999'
    TrackedFlight.objects.filter(user=user, flight_number=flight_number).delete() # Cleanup
    Alert.objects.filter(user=user, flightNumber=flight_number).delete() # Cleanup

    tracked_flight = TrackedFlight.objects.create(
        user=user,
        flight_number=flight_number,
        date=date.today(),
        status='Delayed',
        estimatedDelay=20, # > 15 minutes, should trigger alert
        departureTime=datetime.now(),
        destination='JFK'
    )
    print(f"Created tracked flight: {flight_number} with 20 min delay")

    # 3. Simulate Request to get_new_alerts
    client = APIClient()
    client.force_authenticate(user=user)

    print("Calling get_new_alerts...")
    response = client.get('/api/alerts/new/')
    
    print(f"Response Status: {response.status_code}")
    
    # 4. Verify Alert Creation
    alerts = Alert.objects.filter(user=user, flightNumber=flight_number)
    
    with open('verification_result.txt', 'w') as f:
        if alerts.exists():
            print(f"SUCCESS: Alert generated for flight {flight_number}")
            f.write(f"SUCCESS: Alert generated for flight {flight_number}\n")
            f.write(f"Alert Title: {alerts.first().title}\n")
            f.write(f"Alert Message: {alerts.first().message}\n")
        else:
            print(f"FAILURE: No alert generated for flight {flight_number}")
            f.write(f"FAILURE: No alert generated for flight {flight_number}\n")
            f.write(f"Response Status: {response.status_code}\n")
            if response.status_code >= 400:
                try:
                    f.write(f"Response Error: {response.data}\n")
                except AttributeError:
                    f.write(f"Response Content: {response.content.decode()}\n")

    # Cleanup
    tracked_flight.delete()
    alerts.delete()

if __name__ == '__main__':
    verify_alerts()
