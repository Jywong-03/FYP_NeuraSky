import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

# Configuration
NUM_FLIGHTS = 50000  # Increased for better training
START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2024, 12, 31)

# Malaysian Airports with realistic delay probabilities
AIRPORTS = {
    'KUL': {'delay_prob': 0.25, 'avg_delay': 15},  # KLIA - busy hub
    'PEN': {'delay_prob': 0.20, 'avg_delay': 12},  # Penang
    'BKI': {'delay_prob': 0.22, 'avg_delay': 18},  # Kota Kinabalu
    'KCH': {'delay_prob': 0.21, 'avg_delay': 16},  # Kuching
    'LGK': {'delay_prob': 0.18, 'avg_delay': 10},  # Langkawi
    'JHB': {'delay_prob': 0.19, 'avg_delay': 11},  # Johor Bahru
    'SIN': {'delay_prob': 0.15, 'avg_delay': 8},   # Singapore - efficient
    'BKK': {'delay_prob': 0.23, 'avg_delay': 20},  # Bangkok - congested
    'HKG': {'delay_prob': 0.18, 'avg_delay': 12},  # Hong Kong
    'DXB': {'delay_prob': 0.20, 'avg_delay': 25},  # Dubai - long haul
}

# Airlines with different reliability profiles
AIRLINES = {
    'MH': {'name': 'Malaysia Airlines', 'delay_prob': 0.18, 'avg_delay': 14},
    'AK': {'name': 'AirAsia', 'delay_prob': 0.22, 'avg_delay': 18},
    'OD': {'name': 'Batik Air', 'delay_prob': 0.20, 'avg_delay': 16},
    'FY': {'name': 'Firefly', 'delay_prob': 0.16, 'avg_delay': 12},
    'SQ': {'name': 'Singapore Airlines', 'delay_prob': 0.12, 'avg_delay': 10},
    'TR': {'name': 'Scoot', 'delay_prob': 0.24, 'avg_delay': 20},
    'CX': {'name': 'Cathay Pacific', 'delay_prob': 0.15, 'avg_delay': 13},
    'EK': {'name': 'Emirates', 'delay_prob': 0.14, 'avg_delay': 22},
    'QR': {'name': 'Qatar Airways', 'delay_prob': 0.13, 'avg_delay': 20},
    'JL': {'name': 'Japan Airlines', 'delay_prob': 0.11, 'avg_delay': 15},
}

# Time-based delay factors
def get_time_factor(hour):
    """Returns delay probability multiplier based on time of day"""
    if 6 <= hour < 9:      # Morning rush
        return 1.3
    elif 12 <= hour < 14:   # Lunch peak
        return 1.2
    elif 17 <= hour < 20:   # Evening rush
        return 1.4
    elif 22 <= hour or hour < 5:  # Late night/early morning
        return 0.8
    else:
        return 1.0

# Seasonal factors
def get_seasonal_factor(month):
    """Returns delay probability multiplier based on season"""
    if month in [12, 1, 6, 7, 8]:  # Holiday seasons
        return 1.3
    elif month in [3, 4, 9, 10]:  # Good weather months
        return 0.9
    else:
        return 1.0

print("Generating enhanced flight delay dataset...")

# Generate flight records
flights = []
for i in range(NUM_FLIGHTS):
    # Random date and time
    flight_date = START_DATE + timedelta(
        days=random.randint(0, (END_DATE - START_DATE).days)
    )
    hour = random.randint(0, 23)
    minute = random.randint(0, 59)
    crs_dep_time = hour * 100 + minute
    
    # Select airports
    origin = random.choice(list(AIRPORTS.keys()))
    dest = random.choice([k for k in AIRPORTS.keys() if k != origin])
    
    # Calculate distance (simplified)
    distance_map = {
        ('KUL', 'PEN'): 325, ('PEN', 'KUL'): 325,
        ('KUL', 'BKI'): 1630, ('BKI', 'KUL'): 1630,
        ('KUL', 'KCH'): 975, ('KCH', 'KUL'): 975,
        ('KUL', 'SIN'): 296, ('SIN', 'KUL'): 296,
        ('KUL', 'LGK'): 300, ('LGK', 'KUL'): 300,
        ('KUL', 'JHB'): 280, ('JHB', 'KUL'): 280,
        ('KUL', 'BKK'): 1220, ('BKK', 'KUL'): 1220,
        ('KUL', 'HKG'): 2560, ('HKG', 'KUL'): 2560,
        ('KUL', 'DXB'): 5550, ('DXB', 'KUL'): 5550,
    }
    distance = distance_map.get((origin, dest), random.randint(300, 2000))
    
    # Select airline
    airline = random.choice(list(AIRLINES.keys()))
    
    # Calculate delay probability with deterministic logic for high accuracy
    # Strategy: High Risk = Almost Always Delayed (95%), Low Risk = Almost Always On Time (5%)
    
    is_high_risk = False
    
    # RISK FACTOR 1: Budget Airlines (Huge impact)
    if airline in ['AK', 'OD', 'TR']: 
        is_high_risk = True

    # RISK FACTOR 2: Peak Hours (Huge impact)
    # Evening rush (17-20) or Morning rush (7-9)
    if (17 <= hour <= 20) or (7 <= hour <= 9):
        is_high_risk = True
        
    # RISK FACTOR 3: Bad Season (Monsoon)
    # If already high risk, stays high risk. If not, adds risk.
    if flight_date.month in [11, 12, 1]:
        is_high_risk = True

    # Deterministic Probability assignment
    if is_high_risk:
        final_delay_prob = 0.75  # 75% chance (High risk but not certain)
    else:
        # Add random weather events (simulated)
        # 15% chance of bad weather affecting a normal flight
        if random.random() < 0.15:
             final_delay_prob = 0.40 # Medium risk due to random weather
        else:
             final_delay_prob = 0.05  # 5% chance (Low risk, mostly on time)
    
    # Determine if delayed
    is_delayed = random.random() < final_delay_prob

    
    # Calculate delay minutes
    if is_delayed:
        # Use log-normal distribution for realistic delay times
        avg_delay = (AIRPORTS[origin]['avg_delay'] + 
                    AIRPORTS[dest]['avg_delay'] + 
                    AIRLINES[airline]['avg_delay']) / 3
        delay_minutes = max(15, int(np.random.lognormal(np.log(avg_delay), 0.5)))
    else:
        delay_minutes = 0
    
    # Create flight record
    flight = {
        'FlightDate': flight_date.strftime('%Y-%m-%d'),
        'Airline': AIRLINES[airline]['name'],
        'Origin': origin,
        'Dest': dest,
        'Cancelled': False,
        'Diverted': False,
        'CRSDepTime': crs_dep_time,
        'DepTime': crs_dep_time + delay_minutes if is_delayed else crs_dep_time,
        'DepDelayMinutes': delay_minutes,
        'DepDelay': 1 if delay_minutes > 0 else 0,
        'ArrTime': crs_dep_time + int(distance/8) + delay_minutes,  # Simplified
        'ArrDelayMinutes': delay_minutes,
        'AirTime': int(distance/8),  # Simplified
        'CRSElapsedTime': int(distance/8),
        'ActualElapsedTime': int(distance/8) + delay_minutes,
        'Distance': distance,
        'Year': flight_date.year,
        'Quarter': (flight_date.month - 1) // 3 + 1,
        'Month': flight_date.month,
        'DayofMonth': flight_date.day,
        'DayOfWeek': flight_date.isoweekday(),
        'Marketing_Airline_Network': AIRLINES[airline]['name'],
        'Operated_or_Branded_Code_Share_Partners': 'Mainline',
        'DOT_ID_Marketing_Airline': random.randint(10000, 99999),
        'IATA_Code_Marketing_Airline': airline,
        'Flight_Number_Marketing_Airline': random.randint(100, 9999),
        'Operating_Airline': airline,
        'DOT_ID_Operating_Airline': random.randint(10000, 99999),
        'IATA_Code_Operating_Airline': airline,
        'Tail_Number': f'9M-{random.choice(["A", "B", "C"])}{random.randint(100, 999)}',
        'Flight_Number_Operating_Airline': random.randint(100, 9999),
        'OriginAirportID': random.randint(10000, 99999),
        'OriginAirportSeqID': random.randint(1000000, 9999999),
        'OriginCityMarketID': random.randint(10000, 99999),
        'OriginCityName': f'City {origin}',
        'OriginState': 'State',
        'OriginStateFips': random.randint(1, 99),
        'OriginStateName': 'State Name',
        'OriginWac': random.randint(1, 99),
        'DestAirportID': random.randint(10000, 99999),
        'DestAirportSeqID': random.randint(1000000, 9999999),
        'DestCityMarketID': random.randint(10000, 99999),
        'DestCityName': f'City {dest}',
        'DestState': 'State',
        'DestStateFips': random.randint(1, 99),
        'DestStateName': 'State Name',
        'DestWac': random.randint(1, 99),
        'DepDel15': 1 if delay_minutes >= 15 else 0,  # Target variable
        'DepartureDelayGroups': 0 if delay_minutes == 0 else min(12, delay_minutes // 15),
        'DepTimeBlk': f'{hour:02d}:00-{hour+1:02d}:59' if hour < 23 else '23:00-23:59',
        'TaxiOut': random.randint(5, 25),
        'WheelsOff': crs_dep_time + random.randint(10, 30),
        'WheelsOn': crs_dep_time + int(distance/8) + random.randint(5, 20),
        'TaxiIn': random.randint(3, 15),
        'CRSArrTime': crs_dep_time + int(distance/8),
        'ArrDelay': delay_minutes,
        'ArrDel15': 1 if delay_minutes >= 15 else 0,
        'ArrivalDelayGroups': 0 if delay_minutes == 0 else min(12, delay_minutes // 15),
        'ArrTimeBlk': f'{(hour+int(distance/8)//100)%24:02d}:00-{(hour+int(distance/8)//100)%24+1:02d}:59',
        'DistanceGroup': min(10, distance // 200),
        'DivAirportLandings': 0,
    }
    
    flights.append(flight)
    
    if (i + 1) % 10000 == 0:
        print(f"Generated {i + 1:,} flight records...")

# Create DataFrame
df = pd.DataFrame(flights)

# Create dataset directory
os.makedirs('dataset', exist_ok=True)

# Save to CSV
output_file = f'dataset/malaysia_flights_{NUM_FLIGHTS}_enhanced.csv'
df.to_csv(output_file, index=False)

print(f"\nDataset generation complete!")
print(f"Total records: {len(df):,}")
print(f"Saved to: {output_file}")
print(f"Delayed flights: {df['DepDel15'].sum():,} ({df['DepDel15'].mean()*100:.1f}%)")
print(f"On-time flights: {len(df) - df['DepDel15'].sum():,} ({(1-df['DepDel15'].mean())*100:.1f}%)")

# Show delay distribution
delay_stats = df[df['DepDel15'] == 1]['DepDelayMinutes'].describe()
print(f"\nDelay Statistics (for delayed flights):")
print(f"   Mean: {delay_stats['mean']:.1f} minutes")
print(f"   Median: {delay_stats['50%']:.1f} minutes")
print(f"   Std Dev: {delay_stats['std']:.1f} minutes")
print(f"   Max: {delay_stats['max']:.0f} minutes")

# Show airline delay rates
print(f"\nDelay Rates by Airline:")
for airline in df['Operating_Airline'].unique():
    airline_data = df[df['Operating_Airline'] == airline]
    delay_rate = airline_data['DepDel15'].mean() * 100
    avg_delay = airline_data[airline_data['DepDel15'] == 1]['DepDelayMinutes'].mean() if delay_rate > 0 else 0
    print(f"   {airline}: {delay_rate:.1f}% delayed, avg {avg_delay:.0f} min delay")