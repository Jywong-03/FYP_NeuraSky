import os
import joblib
import pandas as pd
import numpy as np
from django.conf import settings
from datetime import datetime

# Global variables to hold model artifacts
ML_MODEL = None
DATA_ENCODER = None
FEATURE_NAMES = None
TRAINING_METRICS = None

def load_ml_model():
    """
    Loads the ML model and related artifacts into global variables.
    This should be called when the app starts or when needed.
    """
    global ML_MODEL, DATA_ENCODER, FEATURE_NAMES, TRAINING_METRICS
    
    # Paths
    MODEL_PATH = os.path.join(settings.BASE_DIR, 'api', 'flight_delay_model.joblib')
    ENCODER_PATH = os.path.join(settings.BASE_DIR, 'api', 'flight_data_encoder.joblib')
    FEATURES_PATH = os.path.join(settings.BASE_DIR, 'api', 'model_features.joblib')
    METRICS_PATH = os.path.join(settings.BASE_DIR, 'api', 'training_metrics.joblib')

    try:
        ML_MODEL = joblib.load(MODEL_PATH)
        DATA_ENCODER = joblib.load(ENCODER_PATH)
        FEATURE_NAMES = joblib.load(FEATURES_PATH)
        TRAINING_METRICS = joblib.load(METRICS_PATH)
        print(f"✅ Enhanced ML Model loaded successfully (ml_utils)")
        return True
    except Exception as e:
        print(f"❌ CRITICAL ERROR: Could not load enhanced model in ml_utils. Error: {e}")
        return False

# Initialize on module import (optional, or call explicitly in AppConfig)
load_ml_model()

# Helper Functions used in Prediction
def get_estimated_distance(origin, dest):
    distances = {
        ('KUL', 'PEN'): 325, ('PEN', 'KUL'): 325,
        ('KUL', 'BKI'): 1630, ('BKI', 'KUL'): 1630,
        ('KUL', 'KCH'): 975, ('KCH', 'KUL'): 975,
        ('KUL', 'LGK'): 300, ('LGK', 'KUL'): 300,
        ('KUL', 'JHB'): 280, ('JHB', 'KUL'): 280,
        ('KUL', 'AOR'): 650, ('AOR', 'KUL'): 650,
        ('KUL', 'MYY'): 1150, ('MYY', 'KUL'): 1150,
        ('PEN', 'BKI'): 1350, ('BKI', 'PEN'): 1350,
        ('PEN', 'KCH'): 750, ('KCH', 'PEN'): 750,
        ('KUL', 'SIN'): 296, ('SIN', 'KUL'): 296,
        ('KUL', 'BKK'): 1220, ('BKK', 'KUL'): 1220,
        ('KUL', 'HKG'): 2560, ('HKG', 'KUL'): 2560,
        ('KUL', 'NRT'): 5320, ('NRT', 'KUL'): 5320,
        ('KUL', 'ICN'): 4620, ('ICN', 'KUL'): 4620,
        ('KUL', 'LHR'): 10600, ('LHR', 'KUL'): 10600,
        ('KUL', 'SYD'): 6530, ('SYD', 'KUL'): 6530,
        ('KUL', 'DXB'): 5550, ('DXB', 'KUL'): 5550,
        ('KUL', 'DOH'): 5630, ('DOH', 'KUL'): 5630,
    }
    return distances.get((origin, dest), 800)

def is_international_route(origin, dest):
    malaysian_airports = {'KUL', 'PEN', 'BKI', 'KCH', 'LGK', 'JHB', 'AOR', 'MYY', 'SDK', 'TWU'}
    return (origin not in malaysian_airports) or (dest not in malaysian_airports)

def get_time_of_day(hour):
    if 0 <= hour < 6: return 'Night'
    elif 6 <= hour < 12: return 'Morning'
    elif 12 <= hour < 18: return 'Afternoon'
    else: return 'Evening'

def is_peak_hour(hour):
    return hour in [7, 8, 9, 17, 18, 19, 20]

def calculate_flight_risk(origin, destination, departure_time, airline='MH'):
    """
    Calculates the risk of delay for a given flight.
    Returns a dictionary with probability, risk_level, and risk_factors.
    """
    if not all([ML_MODEL, DATA_ENCODER, FEATURE_NAMES]):
        return {'error': 'Model not loaded'}

    try:
        # Prepare Data
        current_time = departure_time if departure_time else datetime.now()
        month = current_time.month
        day_of_week = current_time.isoweekday()
        hour = current_time.hour
        
        distance = get_estimated_distance(origin, destination)
        crs_dep_time = hour * 100
        
        input_data = pd.DataFrame([{
            'Month': month,
            'DayOfWeek': day_of_week,
            'CRSDepTime': crs_dep_time,
            'Operating_Airline': airline,
            'Origin': origin,
            'Dest': destination,
            'Distance': distance,
            'Hour': hour,
            'IsInternational': int(is_international_route(origin, destination)),
            'IsPeakHour': int(is_peak_hour(hour)),
            'IsWeekend': int(day_of_week in [6, 7]),
            'TimeOfDay': get_time_of_day(hour)
        }])
        
        # Transform Features
        categorical_cols = ['Operating_Airline', 'Origin', 'Dest', 'TimeOfDay']
        try:
             # Handle unknown categories gracefully if possible, or catch error
            input_data[categorical_cols] = DATA_ENCODER.transform(input_data[categorical_cols])
        except Exception as e:
            # Fallback if unknown route/airport code to avoid crash
            print(f"Encoding error for {origin}->{destination}: {e}")
            return {'probability': 0, 'risk_level': 'Unknown', 'reason': 'Unknown Route'}

        for feature in FEATURE_NAMES:
            if feature not in input_data.columns:
                input_data[feature] = 0
                
        input_data = input_data[FEATURE_NAMES]
        
        # Predict
        prob = ML_MODEL.predict_proba(input_data)[0][1] # Probability of delay
        
        # Determine Risk Level
        if prob > 0.6:
            risk_level = "High"
        elif prob > 0.3:
            risk_level = "Medium"
        else:
            risk_level = "Low"
            
        return {
            'probability': round(prob * 100, 1),
            'risk_level': risk_level,
            'is_peak': is_peak_hour(hour),
            'is_international': is_international_route(origin, destination)
        }

    except Exception as e:
        print(f"Risk calc error: {e}")
        return {'error': str(e)}
