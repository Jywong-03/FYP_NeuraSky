import os
import django
# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.models import User

def verify_analytics():
    print("Starting analytics verification...")
    
    # 1. Create/Get Test User
    username = 'test_analytics_user'
    user, created = User.objects.get_or_create(username=username)
    if created:
        user.set_password('password')
        user.save()

    # 2. Simulate Request
    client = APIClient()
    client.force_authenticate(user=user)

    # 3. Verify Delay Reasons
    print("\nCalling /analytics/delay-reasons/...")
    response = client.get('/api/analytics/delay-reasons/')
    print(f"Response Status: {response.status_code}")
    if response.status_code == 200:
        data = response.data
        print(f"Received {len(data)} delay reasons.")
        if len(data) > 0:
            print("Sample data:", data[0])
            print("SUCCESS: Delay reasons data retrieved.")
        else:
            print("WARNING: No delay reasons found.")
    else:
        print(f"FAILURE: API returned {response.status_code}")

    # 4. Verify Delay Duration
    print("\nCalling /analytics/delay-durations/...")
    response = client.get('/api/analytics/delay-durations/')
    print(f"Response Status: {response.status_code}")
    if response.status_code == 200:
        data = response.data
        print(f"Received {len(data)} duration buckets.")
        if len(data) > 0:
            print("Sample data:", data[0])
            print("SUCCESS: Delay duration data retrieved.")
        else:
            print("WARNING: No duration data found.")
    else:
        print(f"FAILURE: API returned {response.status_code}")

if __name__ == '__main__':
    verify_analytics()
