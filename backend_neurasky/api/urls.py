from django.urls import path
from . import views

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import MyTokenObtainPairView

urlpatterns = [
    # Authentication endpoints
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/delete/', views.DeleteUserView.as_view(), name='delete-user'),
    path('user/profile/', views.user_profile_view, name='user-profile'),
    path('flights/stats/', views.flight_stats_view, name='flight-stats'),

    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),

    # Profile management
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('profile/settings/', views.UserProfileSettingsView.as_view(), name='user-profile-settings'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),

    # Flight management
    path('flights/', views.TrackedFlightView.as_view(), name='tracked-flights'),
    path('flights/<int:pk>/', views.TrackedFlightDetailView.as_view(), name='tracked-flights-detail'),
    path('flight-status/<str:flight_number>/<str:date>/', 
         views.FlightStatusView.as_view(), 
         name='flight-status'),

    # Enhanced ML Prediction Endpoints
    path('health/', views.health_check, name='health-check'),
    path('predict/', 
        views.predict_delay, 
        name='predict-flight'),
    
    path('model-info/', 
        views.model_info, 
        name='model-info'),

    # Alert system
    path('alerts/', views.get_all_alerts, name='get-all-alerts'),
    path('alerts/new/', views.get_new_alerts, name='get-new-alerts'),
    path('alerts/mark-read/', views.mark_alert_read, name='mark-alert-read'),
    path('alerts/mark-all-read/', views.mark_all_alerts_read, name='mark-all-alerts-read'),
    path('alerts/delete/', views.delete_alert, name='delete-alert'),

    # Analytics endpoints
    path('analytics/delay-reasons/', views.DelayReasonsView.as_view(), name='delay-reasons'),
    path('analytics/delay-durations/', views.DelayDurationView.as_view(), name='delay-durations'),
    path('analytics/historical-trends/', views.HistoricalTrendsView.as_view(), name='historical-trends'),
    path('analytics/route-forecast/', views.RouteForecastView.as_view(), name='route-forecast'),
]