import os
import django
# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.models import User

def verify_trends():
    print("Starting historical trends verification...")
    
    # 1. Create/Get Test User
    username = 'test_trends_user'
    user, created = User.objects.get_or_create(username=username)
    if created:
        user.set_password('password')
        user.save()

    # 2. Simulate Request
    client = APIClient()
    client.force_authenticate(user=user)

    print("Calling /analytics/historical-trends/...")
    response = client.get('/api/analytics/historical-trends/')
    
    print(f"Response Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.data
        print(f"Received {len(data)} months of data.")
        if len(data) > 0:
            print("Sample data:", data[0])
            print("SUCCESS: Historical trends data retrieved.")
        else:
            print("WARNING: No historical data found. Did you populate the database?")
    else:
        print(f"FAILURE: API returned {response.status_code}")
        print(response.data)

if __name__ == '__main__':
    verify_trends()
