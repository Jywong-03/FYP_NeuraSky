from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import random
import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

# Path to models (if we were using the US ones)
MODEL_PATH = 'api/flight_delay_model.joblib'
ENCODER_PATH = 'api/flight_data_encoder.joblib'

def get_simulated_weather(city_code):
    """
    Returns a simulated weather condition and temperature for a given city code.
    For demo purposes, we randomize this but keep it consistent for a short session if needed, 
    or just pure random for 'Wow' factor on every click.
    """
    conditions = ['Clear Sky', 'Scattered Clouds', 'Light Rain', 'Thunderstorms', 'Haze']
    
    # Malaysia Context Temperatures (roughly 24-34 celcius)
    temp = random.randint(24, 34)
    condition = random.choice(conditions)
    
    # Heuristic: make it rain more often in tropical KUL/PEN
    if city_code in ['KUL', 'PEN', 'JB', 'KCH', 'BKI']:
        if random.random() < 0.4:
            condition = 'Thunderstorms'
    
    return {'condition': condition, 'temp': f"{temp}°C"}

@csrf_exempt
def predict_delay(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    try:
        data = json.loads(request.body)
        airline = data.get('airline')
        flight_number = data.get('flight_number')
        origin = data.get('origin')
        destination = data.get('destination')
        # date_str = data.get('date') 
        # time_str = data.get('time')
        
        # 1. Get Weather Context
        origin_weather = get_simulated_weather(origin)
        dest_weather = get_simulated_weather(destination)
        
        response_data = {
            'origin_weather': origin_weather,
            'dest_weather': dest_weather,
            'flight_number': flight_number,
            'route': f"{origin} → {destination}",
        }

        # 2. Prediction Logic
        
        # MALAYSIA / REGIONAL CONTEXT (Heuristic / Demo)
        malaysia_airports = ['KUL', 'PEN', 'BKI', 'KCH', 'LGK', 'JHB', 'SZB', 'SIN', 'BKK']
        malaysia_airlines = ['MH', 'AK', 'OD', 'FY', 'TR', 'SQ']
        
        is_malaysia_route = (origin in malaysia_airports or destination in malaysia_airports)
        
        if is_malaysia_route:
            # Logic: If thunderstorms at origin or dest, high chance of delay
            if 'Thunderstorms' in [origin_weather['condition'], dest_weather['condition']]:
                outcome = 'Likely Delayed'
                confidence = random.randint(75, 95)
                delay_minutes = random.randint(30, 120)
                reason = "Weather Conditions (Thunderstorms)"
            elif 'Rain' in origin_weather['condition'] or 'Rain' in dest_weather['condition']:
                outcome = 'Risk of Delay'
                confidence = random.randint(60, 80)
                delay_minutes = random.randint(15, 45)
                reason = "Weather Conditions (Rain)"
            else:
                # Random "Operational" delays
                if random.random() < 0.2:
                    outcome = 'Delayed'
                    confidence = random.randint(60, 85)
                    delay_minutes = random.randint(15, 60)
                    reason = "Late Inbound Aircraft"
                else:
                    outcome = 'On Time'
                    confidence = random.randint(80, 98)
                    delay_minutes = 0
                    reason = "Optimal Conditions"
                    
            response_data.update({
                'prediction': outcome,
                'confidence': f"{confidence}%",
                'estimated_delay_minutes': delay_minutes,
                'reason': reason
            })
            
            return JsonResponse(response_data)

        # US / GLOBAL CONTEXT (Try using the Model)
        # Note: Model expects specific encoded features. If inputs don't match trained encoder categories, it errors/warns.
        # For simplicity in this hybrid demo, we might fallback to heuristics if model fails or inputs are unknown.
        
        # ... (Implementation of model loading would go here, but omitted for reliability of the Malaysia Demo request)
        # Fallback for non-Malaysia routes in this demo:
        response_data.update({
            'prediction': 'On Time',
            'confidence': '85%',
            'estimated_delay_minutes': 0,
            'reason': 'Normal Operations'
        })
        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
