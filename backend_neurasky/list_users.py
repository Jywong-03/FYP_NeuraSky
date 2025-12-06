import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from django.contrib.auth.models import User

def list_users():
    print("--- User List ---")
    for u in User.objects.all():
        print(f"ID: {u.id} | Username: '{u.username}' | Email: '{u.email}'")

if __name__ == '__main__':
    list_users()
