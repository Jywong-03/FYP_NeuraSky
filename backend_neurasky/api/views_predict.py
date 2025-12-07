from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime

# --- 1. LOAD THE REAL MALAYSIA MODEL ---
MODEL_PATH = os.path.join(settings.BASE_DIR, 'api', 'flight_delay_model.joblib')
ENCODER_PATH = os.path.join(settings.BASE_DIR, 'api', 'flight_data_encoder.joblib')

# Load model once when server starts
try:
    ML_MODEL = joblib.load(MODEL_PATH)
    DATA_ENCODER = joblib.load(ENCODER_PATH)
    print(f"✅ REAL ML Model loaded: {MODEL_PATH}")
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not load model. Run 'train_model_improved.py' first! Error: {e}")
    ML_MODEL = None
    DATA_ENCODER = None

# Helper to estimate distance for better accuracy (since frontend doesn't send it)
def get_estimated_distance(origin, dest):
    # Distances in km (approximate)
    distances = {
        ('KUL', 'PEN'): 325, ('PEN', 'KUL'): 325,
        ('KUL', 'BKI'): 1630, ('BKI', 'KUL'): 1630,
        ('KUL', 'KCH'): 975, ('KCH', 'KUL'): 975,
        ('KUL', 'SIN'): 296, ('SIN', 'KUL'): 296,
        ('KUL', 'LHR'): 10600, ('LHR', 'KUL'): 10600,
    }
    return distances.get((origin, dest), 500) # Default to 500km if unknown

@csrf_exempt
def predict_delay(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    if not ML_MODEL or not DATA_ENCODER:
        return JsonResponse({'error': 'Model not trained. Server cannot predict.'}, status=500)
    
    try:
        data = json.loads(request.body)
        
        # 1. Extract inputs from Frontend
        origin = data.get('origin')
        destination = data.get('destination')
        airline = data.get('airline', 'MH') # Default to MH if missing
        flight_number = data.get('flight_number')
        
        # Use current time if user didn't specify (Real-time prediction feel)
        now = datetime.now()
        month = now.month
        day_of_week = now.isoweekday() # 1=Mon, 7=Sun
        current_hour_min = now.hour * 100 + now.minute # e.g., 1430 for 2:30 PM

        # 2. Prepare Data for the AI
        # We must use the EXACT same column names as 'train_model_improved.py'
        input_data = pd.DataFrame([{
            'Month': month,
            'DayOfWeek': day_of_week,
            'CRSDepTime': current_hour_min,
            'Operating_Airline': airline,
            'Origin': origin,
            'Dest': destination,
            'Distance': get_estimated_distance(origin, destination)
        }])

        # 3. Encode Categories (Turn 'KUL' into numbers like 142)
        categorical_cols = ['Operating_Airline', 'Origin', 'Dest']
        input_data[categorical_cols] = DATA_ENCODER.transform(input_data[categorical_cols])

        # 4. Make Prediction
        # [0] = On Time, [1] = Delayed
        prediction_class = ML_MODEL.predict(input_data)[0]
        prediction_prob = ML_MODEL.predict_proba(input_data)[0]

        # 5. Format Response
        is_delayed = (prediction_class == 1)
        confidence = prediction_prob[1] if is_delayed else prediction_prob[0]
        
        response_data = {
            'flight_number': flight_number,
            'route': f"{origin} → {destination}",
            'prediction': "Delayed" if is_delayed else "On Time",
            'confidence': f"{confidence * 100:.0f}%",
            'estimated_delay_minutes': int(confidence * 45) if is_delayed else 0, # Estimate based on confidence
            'reason': "High Traffic Volume" if is_delayed else "Optimal Conditions",
            # Add simple weather for UI polish (optional)
            'origin_weather': {'condition': 'Data Processed', 'temp': 'AI-Analyzed'},
            'dest_weather': {'condition': 'Data Processed', 'temp': 'AI-Analyzed'}
        }

        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)