from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # /api/register/
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/delete/', views.DeleteUserView.as_view(), name='delete-user'),
    path('user/profile/', views.user_profile_view, name='user-profile'),
    path('flights/stats/', views.flight_stats_view, name='flight-stats'),

    # /api/login/ (This is your login endpoint for LoginPage.jsx)
    # Django Rest Framework gives you this for free!
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),

    # /api/login/refresh/ (For refreshing tokens later)
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('profile/settings/', views.UserProfileSettingsView.as_view(), name='user-profile-settings'),

    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('flights/', views.TrackedFlightView.as_view(), name='tracked-flights'),

    path('flight-status/<str:flight_number>/<str:date>/', 
         views.FlightStatusView.as_view(), 
         name='flight-status'),

    # ML Prediction Endpoint
    path('predict/', 
        views.PredictionView.as_view(), 
        name='predict-flight'),


    path('analytics/delay-reasons/', views.DelayReasonsView.as_view(), name='delay-reasons'),
    path('analytics/delay-durations/', views.DelayDurationView.as_view(), name='delay-durations'),
    path('analytics/historical-trends/', views.HistoricalTrendsView.as_view(), name='historical-trends'),
]