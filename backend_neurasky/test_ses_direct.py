import os
import django
import sys

# Setup Django Environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from api.models import UserProfile

def check_ses():
    print("--- Checking SES Configuration ---")
    print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    
    # 1. Check User Profile
    print("\n--- Checking User Settings ---")
    # Assuming the user logged in is likely the last one or we pick one
    # We'll list all users to be sure
    for user in User.objects.all():
        profile = getattr(user, 'profile', None)
        email_enabled = profile.emailNotifications if profile else "No Profile"
        print(f"User: {user.username} | Email: {user.email} | Notifications: {email_enabled}")
        
    # 2. Try Sending Test Email
    target_email = "jywong03@gmail.com" # Default or ask user. Let's try to find a valid user email.
    
    # Try to find a user with an email
    valid_user = User.objects.exclude(email='').first()
    if valid_user:
        target_email = valid_user.email
        print(f"\nAttempting to send email to: {target_email}")
        
        try:
            send_mail(
                subject="NeuraSky SES Test",
                message="If you receive this, SES is working.",
                from_email=None, 
                recipient_list=[target_email],
                fail_silently=False
            )
            print("✅ Email Sent Successfully!")
        except Exception as e:
            print(f"❌ Email Send Failed: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("No user with email found to test.")

if __name__ == "__main__":
    check_ses()
