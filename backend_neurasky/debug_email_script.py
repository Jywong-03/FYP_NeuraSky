from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from api.models import UserProfile
import traceback

print("--- Checking SES Configuration ---")
print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

print("\n--- Checking User Settings ---")
for user in User.objects.all():
    profile = getattr(user, 'profile', None)
    email_enabled = profile.emailNotifications if profile else "No Profile"
    print(f"User: {user.username} | Email: {user.email} | Notifications: {email_enabled}")

print("\n--- Sending Test Email ---")
target_user = User.objects.exclude(email='').last() # Get the last user with an email
if target_user:
    print(f"Targeting: {target_user.email}")
    try:
        send_mail(
            subject="NeuraSky Debug Email",
            message="This is a test email to verify SES connectivity.",
            from_email=None,
            recipient_list=[target_user.email],
            fail_silently=False
        )
        print("✅ Email Sent Successfully!")
    except Exception as e:
        print(f"❌ Email Failed: {e}")
        # traceback.print_exc()
else:
    print("No user found to email.")
