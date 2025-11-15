from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # /api/register/
    path('register/', views.RegisterView.as_view(), name='register'),

    # /api/login/ (This is your login endpoint for LoginPage.jsx)
    # Django Rest Framework gives you this for free!
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # /api/login/refresh/ (For refreshing tokens later)
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('flights/', views.TrackedFlightView.as_view(), name='tracked-flights'),

    path('flight-status/<str:flight_number>/<str:date>/', 
         views.FlightStatusView.as_view(), 
         name='flight-status'),

    # ML Prediction Endpoint
    path('predict/', 
        views.PredictionView.as_view(), 
        name='predict-flight'),
]