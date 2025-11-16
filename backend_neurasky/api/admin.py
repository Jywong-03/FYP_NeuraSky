from django.contrib import admin
from .models import TrackedFlight, Alert

# Register your models here.
admin.site.register(TrackedFlight)
admin.site.register(Alert)