import os
import sys
import django

# Add the project directory to sys.path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')

try:
    django.setup()
    print("Django setup successful.")
    from api import views
    print("Successfully imported api.views")
except Exception as e:
    print(f"Failed to import api.views: {e}")
    import traceback
    traceback.print_exc()
