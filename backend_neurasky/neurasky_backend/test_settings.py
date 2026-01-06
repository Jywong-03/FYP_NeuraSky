from .settings import *
import os

# Use SQLite for testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'test_db.sqlite3',
    }
}

# Disable email sending for tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
