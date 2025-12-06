import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OrdinalEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import os

import glob

# 1. Load Data
print("Loading data...")
# The data is split into multiple files in the 'dataset' directory
DATA_DIR = 'dataset'
if not os.path.exists(DATA_DIR):
    DATA_DIR = r'c:\Users\Dell\Desktop\FYP_NeuraSky\backend_neurasky\dataset'

csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
print(f"Found {len(csv_files)} CSV files: {csv_files}")

df_list = []
for filename in csv_files:
    df_list.append(pd.read_csv(filename))

if not df_list:
    raise FileNotFoundError("No CSV files found in dataset directory.")

df = pd.concat(df_list, ignore_index=True)
print(f"Data loaded. Shape: {df.shape}")

# 2. Define target and features
target = 'DepDel15'
features = [
    'Month',
    'DayOfWeek',
    'CRSDepTime',        # Scheduled Departure Time
    'Operating_Airline', # Unique Carrier Code
    'Origin',            # Origin Airport Code
    'Dest',              # Destination Airport Code
    'Distance'           # Distance
]

categorical_features = ['Operating_Airline', 'Origin', 'Dest']

# 3. Clean the data
print("Cleaning data...")
df_train = df.dropna(subset=features + [target])
print(f"Size after dropping missing values: {df_train.shape[0]} rows")

# 4. Prepare X and y
X = df_train[features].copy()
y = df_train[target]

# 5. Encode categorical features
print("Encoding categorical features...")
encoder = OrdinalEncoder(
    handle_unknown='use_encoded_value', 
    unknown_value=-1,
    dtype=int
)

X[categorical_features] = encoder.fit_transform(X[categorical_features])

# 6. Split data
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=True)

# 7. Calculate scale_pos_weight for class imbalance
# ratio of negative (0) to positive (1)
neg_count = (y_train == 0).sum()
pos_count = (y_train == 1).sum()
scale_pos_weight = neg_count / pos_count if pos_count > 0 else 1

print(f"Class Imbalance Ratio (scale_pos_weight): {scale_pos_weight:.2f}")

# 8. Train Model
print("Training LightGBM model with improvements...")
model = lgb.LGBMClassifier(
    objective='binary',
    n_estimators=500,        # Increased from 100
    learning_rate=0.05,      # Lower learning rate for better generalization
    num_leaves=63,           # Increased complexity
    scale_pos_weight=scale_pos_weight, # Handle class imbalance
    n_jobs=-1,
    random_state=42
)

model.fit(X_train, y_train, categorical_feature=categorical_features)
print("Model training complete.")

# 9. Evaluate
print("Evaluating model...")
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)

print("-" * 30)
print("Model Performance Metrics:")
print(f"Accuracy:  {accuracy * 100:.2f}%")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1-Score:  {f1:.4f}")
print("-" * 30)
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print("-" * 30)

# 10. Save Model and Encoder
print("Saving model and encoder...")
MODEL_PATH = 'api/flight_delay_model.joblib'
ENCODER_PATH = 'api/flight_data_encoder.joblib'

# Ensure api directory exists
os.makedirs('api', exist_ok=True)

joblib.dump(model, MODEL_PATH)
joblib.dump(encoder, ENCODER_PATH)
print(f"Model saved to {MODEL_PATH}")
print(f"Encoder saved to {ENCODER_PATH}")
