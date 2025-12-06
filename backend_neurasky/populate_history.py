import os
import django
import pandas as pd
import glob
from datetime import datetime

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neurasky_backend.settings')
django.setup()

from api.models import FlightHistory

def populate_history():
    print("Starting data population...")
    
    # Path to dataset
    DATA_DIR = 'dataset'
    if not os.path.exists(DATA_DIR):
        print(f"Dataset directory '{DATA_DIR}' not found.")
        return

    csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    print(f"Found {len(csv_files)} CSV files.")

    # Optional: Clear existing data
    # print("Clearing existing FlightHistory data...")
    # FlightHistory.objects.all().delete()

    batch_size = 5000
    flight_history_objects = []

    for file_path in csv_files:
        print(f"Processing {file_path}...")
        # Read only necessary columns to save memory
        df = pd.read_csv(file_path, usecols=[
            'FlightDate', 'Operating_Airline', 'DepDel15', 
            'DepDelayMinutes', 'Flight_Number_Operating_Airline'
        ])
        
        # Drop rows with missing values in critical columns
        df.dropna(subset=['FlightDate', 'DepDel15'], inplace=True)

        for _, row in df.iterrows():
            try:
                # Parse date
                flight_date = datetime.strptime(row['FlightDate'], '%Y-%m-%d')
                
                # Determine status
                status = 'Delayed' if row['DepDel15'] == 1.0 else 'On Time'
                
                history_entry = FlightHistory(
                    flight_number=str(row['Flight_Number_Operating_Airline']),
                    airline=row['Operating_Airline'],
                    status=status,
                    delay_minutes=int(row['DepDelayMinutes']) if pd.notna(row['DepDelayMinutes']) else 0,
                    recorded_at=flight_date
                )
                flight_history_objects.append(history_entry)

                if len(flight_history_objects) >= batch_size:
                    FlightHistory.objects.bulk_create(flight_history_objects)
                    flight_history_objects = []
                    print(f"Inserted {batch_size} records...")
            
            except Exception as e:
                print(f"Error processing row: {e}")
                continue

    # Insert remaining objects
    if flight_history_objects:
        FlightHistory.objects.bulk_create(flight_history_objects)
        print(f"Inserted remaining {len(flight_history_objects)} records.")

    print("Data population complete.")

if __name__ == '__main__':
    populate_history()
