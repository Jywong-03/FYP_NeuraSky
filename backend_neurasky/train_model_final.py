import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import OrdinalEncoder
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score, 
                           confusion_matrix, classification_report, roc_auc_score, roc_curve)
from sklearn.utils.class_weight import compute_class_weight
import joblib
import os
import glob
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

print("🚀 Starting Final ML Model Training (Aligned with API)")
print("=" * 60)

# 1. Load Data
print("\n📁 Loading data...")
DATA_DIR = 'dataset'
if not os.path.exists(DATA_DIR):
    print(f"❌ Dataset directory '{DATA_DIR}' not found!")
    exit(1)

csv_files = glob.glob(os.path.join(DATA_DIR, "*.csv"))
print(f"📄 Found {len(csv_files)} CSV files: {[os.path.basename(f) for f in csv_files]}")

df_list = []
for filename in csv_files:
    df_temp = pd.read_csv(filename)
    df_list.append(df_temp)
    print(f"   ✅ Loaded {os.path.basename(filename)}: {len(df_temp):,} records")

if not df_list:
    raise FileNotFoundError("No CSV files found in dataset directory.")

df = pd.concat(df_list, ignore_index=True)
print(f"📊 Total dataset size: {df.shape[0]:,} rows")

# 2. Define target and features
target = 'DepDel15'
features = [
    'Month',
    'DayOfWeek', 
    'CRSDepTime',
    'Operating_Airline',
    'Origin',
    'Dest',
    'Distance'
]

# 3. Feature Engineering (STRICTLY MATCHING API LOGIC)
print("\n🔧 Feature Engineering...")

df['Hour'] = df['CRSDepTime'] // 100

# Fix 1: TimeOfDay (Matching API logic: 0-5 Night, 6-11 Morning, 12-17 Afternoon, 18-23 Evening)
def get_time_of_day_label(hour):
    if 0 <= hour < 6:
        return 'Night'
    elif 6 <= hour < 12:
        return 'Morning'
    elif 12 <= hour < 18:
        return 'Afternoon'
    else:
        return 'Evening'

df['TimeOfDay'] = df['Hour'].apply(get_time_of_day_label)

# Fix 2: IsInternational (Matching API logic with full domestic list)
# Full list of Malaysian airports considered "Domestic"
DOMESTIC_AIRPORTS = [
    'KUL', 'PEN', 'BKI', 'KCH', 'LGK', 'JHB', 'AOR', 'MYY', 'SDK', 'TWU', 
    'KBR', 'TGG', 'IPH', 'MKZ', 'SBW', 'BTU', 'LBU'
]

def check_is_international(row):
    # If BOTH Origin and Dest are in domestic list, it's Domestic (0). Else International (1).
    if row['Origin'] in DOMESTIC_AIRPORTS and row['Dest'] in DOMESTIC_AIRPORTS:
        return 0
    return 1

df['IsInternational'] = df.apply(check_is_international, axis=1)

# Peak Hour
df['IsPeakHour'] = df['Hour'].isin([7, 8, 9, 17, 18, 19, 20]).astype(int)

# Weekend
df['IsWeekend'] = df['DayOfWeek'].isin([6, 7]).astype(int)

# Add to feature list
features.extend(['Hour', 'IsInternational', 'IsPeakHour', 'IsWeekend', 'TimeOfDay'])
categorical_features = ['Operating_Airline', 'Origin', 'Dest', 'TimeOfDay']

# 4. Clean data
df_clean = df.dropna(subset=features + [target])

# 5. Prepare X and y
X = df_clean[features].copy()
y = df_clean[target]

# 6. Encode categorical features
print("🏷️  Encoding categorical features...")
encoder = OrdinalEncoder(
    handle_unknown='use_encoded_value', 
    unknown_value=-1,
    dtype=int
)
X[categorical_features] = encoder.fit_transform(X[categorical_features])
feature_names = features.copy()

# 7. Split data
print("📦 Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y, shuffle=True
)

# 8. Calculate class weights
print("⚖️  Calculating class weights...")
class_weights = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
class_weight_dict = dict(enumerate(class_weights))
print(f"   Class weights: {class_weight_dict}")

# 9. Train Model
print("\n🧠 Training LightGBM model...")
model = lgb.LGBMClassifier(
    objective='binary',
    n_estimators=1000,
    learning_rate=0.05,            # Increased from 0.01 to 0.05 for better convergence
    num_leaves=31,
    max_depth=-1,
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,
    reg_lambda=0.1,
    scale_pos_weight=class_weights[1],
    random_state=42,
    n_jobs=-1
)

model.fit(
    X_train, y_train,
    eval_set=[(X_test, y_test)],
    eval_metric='auc',
    callbacks=[
        lgb.early_stopping(stopping_rounds=50, verbose=True),
        lgb.log_evaluation(period=100)
    ],
    categorical_feature=categorical_features
)

# 10. Evaluation
print("\n📈 Model Evaluation:")
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_pred_proba)

print(f"🎯 Accuracy:  {accuracy*100:.2f}%")
print(f"🎯 Precision: {precision:.4f}")
print(f"🎯 Recall:    {recall:.4f}")
print(f"🎯 F1-Score:  {f1:.4f}")

# 11. Save Artifacts
print("\n💾 Saving artifacts...")
os.makedirs('api', exist_ok=True)
joblib.dump(model, 'api/flight_delay_model.joblib')
joblib.dump(encoder, 'api/flight_data_encoder.joblib')
joblib.dump(feature_names, 'api/model_features.joblib')

# Save metrics text
with open('api/model_metrics.txt', 'w') as f:
    f.write("FLIGHT DELAY PREDICTION MODEL METRICS (BALANCED)\n")
    f.write("=" * 50 + "\n\n")
    f.write(f"Accuracy:  {accuracy*100:.2f}%\n")
    f.write(f"Precision: {precision:.4f}\n")
    f.write(f"Recall:    {recall:.4f}\n")
    f.write(f"F1-Score:  {f1:.4f}\n")
    f.write(f"ROC-AUC:   {roc_auc:.4f}\n")

print("✅ Training complete.")
