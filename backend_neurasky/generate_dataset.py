import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Configuration
NUM_FLIGHTS = 15000
START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2024, 12, 31)

# Airports
AIRPORTS = ['KUL', 'PEN']
OTHER_DOMESTIC = ['BKI', 'KCH', 'LGK', 'JHB', 'KBR', 'TGG', 'AOR', 'MYY', 'SDK', 'TWU']
INTERNATIONAL = ['SIN', 'BKK', 'HKG', 'NRT', 'ICN', 'LHR', 'SYD', 'MEL', 'DXB', 'DOH']
ALL_OTHER_AIRPORTS = OTHER_DOMESTIC + INTERNATIONAL

# Airlines
AIRLINES = {
    'MH': 'Malaysia Airlines',
    'AK': 'AirAsia',
    'OD': 'Batik Air',
    'FY': 'Firefly',
    'SQ': 'Singapore Airlines',
    'TR': 'Scoot',
    'CX': 'Cathay Pacific',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'JL': 'Japan Airlines'
}
AIRLINE_CODES = list(AIRLINES.keys())

# Columns from original dataset (to maintain compatibility)
COLUMNS = [
    'FlightDate', 'Airline', 'Origin', 'Dest', 'Cancelled', 'Diverted', 
    'CRSDepTime', 'DepTime', 'DepDelayMinutes', 'DepDelay', 
    'ArrTime', 'ArrDelayMinutes', 'AirTime', 'CRSElapsedTime', 
    'ActualElapsedTime', 'Distance', 'Year', 'Quarter', 'Month', 
    'DayofMonth', 'DayOfWeek', 'Marketing_Airline_Network', 
    'Operated_or_Branded_Code_Share_Partners', 'DOT_ID_Marketing_Airline', 
    'IATA_Code_Marketing_Airline', 'Flight_Number_Marketing_Airline', 
    'Operating_Airline', 'DOT_ID_Operating_Airline', 
    'IATA_Code_Operating_Airline', 'Tail_Number', 
    'Flight_Number_Operating_Airline', 'OriginAirportID', 
    'OriginAirportSeqID', 'OriginCityMarketID', 'OriginCityName', 
    'OriginState', 'OriginStateFips', 'OriginStateName', 'OriginWac', 
    'DestAirportID', 'DestAirportSeqID', 'DestCityMarketID', 
    'DestCityName', 'DestState', 'DestStateFips', 'DestStateName', 
    'DestWac', 'DepDel15', 'DepartureDelayGroups', 'DepTimeBlk', 
    'TaxiOut', 'WheelsOff', 'WheelsOn', 'TaxiIn', 'CRSArrTime', 
    'ArrDelay', 'ArrDel15', 'ArrivalDelayGroups', 'ArrTimeBlk', 
    'DistanceGroup', 'DivAirportLandings'
]

def generate_flight_data():
    data = []
    
    for _ in range(NUM_FLIGHTS):
        # Date
        days_diff = (END_DATE - START_DATE).days
        flight_date = START_DATE + timedelta(days=random.randint(0, days_diff))
        
        # Route (Ensure at least one end is KUL or PEN)
        if random.random() < 0.5:
            origin = random.choice(AIRPORTS)
            dest = random.choice([a for a in AIRPORTS + ALL_OTHER_AIRPORTS if a != origin])
        else:
            dest = random.choice(AIRPORTS)
            origin = random.choice([a for a in AIRPORTS + ALL_OTHER_AIRPORTS if a != dest])
            
        # Airline
        airline_code = random.choice(AIRLINE_CODES)
        airline_name = AIRLINES[airline_code]
        
        # Flight Number
        flight_num = random.randint(100, 9999)
        
        # Times
        hour = random.randint(0, 23)
        minute = random.randint(0, 59)
        crs_dep_time = hour * 100 + minute
        
        # Duration (approximate based on route type)
        if origin in AIRPORTS and dest in AIRPORTS: # KUL-PEN
            duration = 55 + random.randint(-5, 10)
        elif dest in INTERNATIONAL or origin in INTERNATIONAL:
            duration = random.randint(120, 800)
        else: # Domestic
            duration = random.randint(45, 180)
            
        crs_arr_time_obj = datetime(2024, 1, 1, hour, minute) + timedelta(minutes=duration)
        crs_arr_time = crs_arr_time_obj.hour * 100 + crs_arr_time_obj.minute
        
        # Delays
        is_delayed = random.random() < 0.2 # 20% chance of delay
        dep_delay = 0
        if is_delayed:
            dep_delay = int(np.random.exponential(30)) # Exponential distribution for delay
            
        dep_time = (datetime(2024, 1, 1, hour, minute) + timedelta(minutes=dep_delay)).strftime('%H%M')
        
        # Arrival Delay (correlated with dep delay + random noise)
        arr_delay = dep_delay + random.randint(-10, 10)
        arr_delay = max(arr_delay, -20) # Can arrive early
        
        # Status
        cancelled = 1 if random.random() < 0.01 else 0
        diverted = 1 if random.random() < 0.005 else 0
        
        if cancelled:
            dep_time = 0
            arr_delay = 0
            dep_delay = 0
            
        # Construct row (filling essential cols, others default/random)
        row = {
            'FlightDate': flight_date.strftime('%Y-%m-%d'),
            'Airline': airline_name,
            'Origin': origin,
            'Dest': dest,
            'Cancelled': cancelled,
            'Diverted': diverted,
            'CRSDepTime': crs_dep_time,
            'DepTime': dep_time,
            'DepDelayMinutes': max(0, dep_delay),
            'DepDelay': dep_delay,
            'ArrTime': 0, # Calculated later if needed, or left simplified
            'ArrDelayMinutes': max(0, arr_delay),
            'AirTime': duration - 20, # Approx
            'CRSElapsedTime': duration,
            'ActualElapsedTime': duration + arr_delay - dep_delay,
            'Distance': duration * 8, # Rough approx
            'Year': flight_date.year,
            'Quarter': (flight_date.month - 1) // 3 + 1,
            'Month': flight_date.month,
            'DayofMonth': flight_date.day,
            'DayOfWeek': flight_date.isoweekday(),
            'Marketing_Airline_Network': airline_code,
            'Operated_or_Branded_Code_Share_Partners': airline_code,
            'DOT_ID_Marketing_Airline': 0,
            'IATA_Code_Marketing_Airline': airline_code,
            'Flight_Number_Marketing_Airline': flight_num,
            'Operating_Airline': airline_code,
            'DOT_ID_Operating_Airline': 0,
            'IATA_Code_Operating_Airline': airline_code,
            'Tail_Number': f'9M-{random.randint(100,999)}',
            'Flight_Number_Operating_Airline': flight_num,
            'OriginAirportID': 0,
            'OriginAirportSeqID': 0,
            'OriginCityMarketID': 0,
            'OriginCityName': origin,
            'OriginState': '',
            'OriginStateFips': 0,
            'OriginStateName': '',
            'OriginWac': 0,
            'DestAirportID': 0,
            'DestAirportSeqID': 0,
            'DestCityMarketID': 0,
            'DestCityName': dest,
            'DestState': '',
            'DestStateFips': 0,
            'DestStateName': '',
            'DestWac': 0,
            'DepDel15': 1 if dep_delay > 15 else 0,
            'DepartureDelayGroups': 0,
            'DepTimeBlk': '',
            'TaxiOut': 15,
            'WheelsOff': 0,
            'WheelsOn': 0,
            'TaxiIn': 10,
            'CRSArrTime': crs_arr_time,
            'ArrDelay': arr_delay,
            'ArrDel15': 1 if arr_delay > 15 else 0,
            'ArrivalDelayGroups': 0,
            'ArrTimeBlk': '',
            'DistanceGroup': 0,
            'DivAirportLandings': 0
        }
        data.append(row)
        
    df = pd.DataFrame(data, columns=COLUMNS)
    
    # Ensure dataset directory exists
    import os
    os.makedirs('dataset', exist_ok=True)
    
    # Save
    output_path = 'dataset/Combined_Flights_2024.csv'
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} flights to {output_path}")

if __name__ == "__main__":
    generate_flight_data()
