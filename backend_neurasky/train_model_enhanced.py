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

print("🚀 Starting Enhanced ML Model Training for Flight Delay Prediction")
print("=" * 60)

# 1. Load Data
print("\n📁 Loading data...")
DATA_DIR = 'dataset'
if not os.path.exists(DATA_DIR):
    print(f"❌ Dataset directory '{DATA_DIR}' not found!")
    print("💡 Please run 'python generate_enhanced_dataset.py' first")
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
print(f"📊 Total dataset size: {df.shape[0]:,} rows, {df.shape[1]} columns")

# 2. Data Quality Check
print("\n🔍 Data Quality Check:")
missing_values = df.isnull().sum()
if missing_values.sum() > 0:
    print("⚠️  Missing values found:")
    missing_cols = missing_values[missing_values > 0]
    for col, count in missing_cols.items():
        print(f"   {col}: {count:,}")
else:
    print("✅ No missing values found")

# 3. Define target and features
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

# 4. Add engineered features BEFORE encoding
print("\n🔧 Feature Engineering...")

# Time-based features
df['Hour'] = df['CRSDepTime'] // 100
df['Minute'] = df['CRSDepTime'] % 100

# Create TimeOfDay feature BEFORE encoding
df['TimeOfDay'] = pd.cut(df['Hour'], 
                        bins=[0, 6, 12, 18, 24], 
                        labels=['Night', 'Morning', 'Afternoon', 'Evening'],
                        include_lowest=True)

# Route complexity
df['IsInternational'] = (~df['Origin'].isin(['KUL', 'PEN', 'BKI', 'KCH', 'LGK', 'JHB'])) | \
                        (~df['Dest'].isin(['KUL', 'PEN', 'BKI', 'KCH', 'LGK', 'JHB']))

# Peak hour indicator
df['IsPeakHour'] = df['Hour'].isin([7, 8, 9, 17, 18, 19, 20])

# Weekend indicator
df['IsWeekend'] = df['DayOfWeek'].isin([6, 7])

# Add engineered features to feature list
features.extend(['Hour', 'IsInternational', 'IsPeakHour', 'IsWeekend', 'TimeOfDay'])

# Define categorical features AFTER creating TimeOfDay
categorical_features = ['Operating_Airline', 'Origin', 'Dest', 'TimeOfDay']

# 5. Clean data
print("🧹 Cleaning data...")
initial_count = len(df)
df_clean = df.dropna(subset=features + [target])
print(f"   Removed {initial_count - len(df_clean):,} rows with missing values")
print(f"   Final dataset size: {len(df_clean):,} rows")

# 6. Prepare X and y
X = df_clean[features].copy()
y = df_clean[target]

# Convert boolean to int
X['IsInternational'] = X['IsInternational'].astype(int)
X['IsPeakHour'] = X['IsPeakHour'].astype(int)
X['IsWeekend'] = X['IsWeekend'].astype(int)

# 7. Encode categorical features
print("🏷️  Encoding categorical features...")
encoder = OrdinalEncoder(
    handle_unknown='use_encoded_value', 
    unknown_value=-1,
    dtype=int
)

# Now TimeOfDay exists in the dataframe
X[categorical_features] = encoder.fit_transform(X[categorical_features])

# Store feature names for later use
feature_names = features.copy()

# 8. Check class distribution
print("\n📊 Class Distribution:")
class_counts = y.value_counts()
class_percentages = y.value_counts(normalize=True) * 100

print(f"   On-time (0): {class_counts[0]:,} ({class_percentages[0]:.1f}%)")
print(f"   Delayed (1): {class_counts[1]:,} ({class_percentages[1]:.1f}%)")
print(f"   Class imbalance ratio: 1:{class_counts[0]/class_counts[1]:.2f}")

# 9. Split data with stratification
print("📦 Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2, 
    random_state=42, 
    stratify=y,  # Important for imbalanced datasets
    shuffle=True
)

print(f"   Training set: {len(X_train):,} samples")
print(f"   Test set: {len(X_test):,} samples")

# 10. Calculate class weights for imbalance handling
print("⚖️  Calculating class weights...")
class_weights = compute_class_weight(
    'balanced', 
    classes=np.unique(y_train), 
    y=y_train
)
class_weight_dict = dict(enumerate(class_weights))
print(f"   Class weights: {class_weight_dict}")

# 11. Cross-validation setup
print("🔄 Setting up cross-validation...")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# 12. Enhanced LightGBM Model
print("\n🧠 Training Enhanced LightGBM model...")

model = lgb.LGBMClassifier(
    objective='binary',
    n_estimators=1000,              # More trees
    learning_rate=0.01,            # Lower learning rate
    num_leaves=31,                 # Conservative to prevent overfitting
    max_depth=-1,                  # No limit on depth
    min_child_samples=20,           # Minimum samples in leaf
    subsample=0.8,                 # Row subsampling
    colsample_bytree=0.8,          # Feature subsampling
    reg_alpha=0.1,                 # L1 regularization
    reg_lambda=0.1,                # L2 regularization
    scale_pos_weight=class_weights[1],  # Handle class imbalance
    random_state=42,
    n_jobs=-1,
    importance_type='gain'
)

# Train with early stopping
print("   Training with early stopping...")
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

print("✅ Model training complete!")

# 13. Detailed Evaluation
print("\n📈 Model Evaluation:")
print("=" * 40)

# Predictions
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)[:, 1]

# Basic metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_pred_proba)

print(f"🎯 Accuracy:  {accuracy*100:.2f}%")
print(f"🎯 Precision: {precision:.4f}")
print(f"🎯 Recall:    {recall:.4f}")
print(f"🎯 F1-Score:  {f1:.4f}")
print(f"🎯 ROC-AUC:   {roc_auc:.4f}")

# Detailed classification report
print("\n📋 Detailed Classification Report:")
print(classification_report(y_test, y_pred, target_names=['On-Time', 'Delayed']))

# Confusion Matrix
print("\n🔢 Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
tn, fp, fn, tp = cm.ravel()
print(f"   True Negatives: {tn:,}")
print(f"   False Positives: {fp:,}")
print(f"   False Negatives: {fn:,}")
print(f"   True Positives: {tp:,}")

# Business metrics
print("\n💼 Business Metrics:")
print(f"   Delay Detection Rate: {tp/(tp+fn)*100:.1f}%")  # Recall
print(f"   False Alarm Rate: {fp/(fp+tn)*100:.1f}%")     # FP Rate
print(f"   Overall Accuracy: {(tp+tn)/(tp+tn+fp+fn)*100:.1f}%")

# 14. Feature Importance
print("\n🏆 Feature Importance:")
feature_importance = pd.DataFrame({
    'feature': feature_names,
    'importance': model.feature_importances_
})
feature_importance = feature_importance.sort_values('importance', ascending=False)

print("   Top 10 Features:")
for i, row in feature_importance.head(10).iterrows():
    print(f"   {row['feature']:<20}: {row['importance']:.4f}")

# 15. Save Model and Encoder
print("\n💾 Saving model and encoder...")
MODEL_PATH = 'api/flight_delay_model.joblib'
ENCODER_PATH = 'api/flight_data_encoder.joblib'
FEATURES_PATH = 'api/model_features.joblib'

# Ensure api directory exists
os.makedirs('api', exist_ok=True)

joblib.dump(model, MODEL_PATH)
joblib.dump(encoder, ENCODER_PATH)
joblib.dump(feature_names, FEATURES_PATH)

print(f"✅ Model saved to {MODEL_PATH}")
print(f"✅ Encoder saved to {ENCODER_PATH}")
print(f"✅ Features saved to {FEATURES_PATH}")

# 16. Save training metrics
metrics = {
    'accuracy': accuracy,
    'precision': precision,
    'recall': recall,
    'f1_score': f1,
    'roc_auc': roc_auc,
    'confusion_matrix': cm.tolist(),
    'feature_importance': feature_importance.to_dict(),
    'training_date': datetime.now().isoformat(),
    'dataset_size': len(df_clean),
    'class_distribution': {
        'on_time': int(class_counts[0]),
        'delayed': int(class_counts[1])
    }
}

joblib.dump(metrics, 'api/training_metrics.joblib')
print(f"✅ Training metrics saved to api/training_metrics.joblib")

# 17. Save current metrics to text file for easy viewing
with open('api/model_metrics.txt', 'w') as f:
    f.write("FLIGHT DELAY PREDICTION MODEL METRICS\n")
    f.write("=" * 50 + "\n\n")
    f.write(f"Training Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    f.write(f"Dataset Size: {len(df_clean):,} flights\n\n")
    
    f.write("PERFORMANCE METRICS:\n")
    f.write(f"Accuracy:  {accuracy*100:.2f}%\n")
    f.write(f"Precision: {precision:.4f}\n")
    f.write(f"Recall:    {recall:.4f}\n")
    f.write(f"F1-Score:  {f1:.4f}\n")
    f.write(f"ROC-AUC:   {roc_auc:.4f}\n\n")
    
    f.write("CLASS DISTRIBUTION:\n")
    f.write(f"On-Time:  {class_counts[0]:,} ({class_percentages[0]:.1f}%)\n")
    f.write(f"Delayed:  {class_counts[1]:,} ({class_percentages[1]:.1f}%)\n\n")
    
    f.write("CONFUSION MATRIX:\n")
    f.write(f"True Negatives:  {tn:,}\n")
    f.write(f"False Positives: {fp:,}\n")
    f.write(f"False Negatives: {fn:,}\n")
    f.write(f"True Positives:  {tp:,}\n\n")
    
    f.write("TOP 10 FEATURES:\n")
    for i, row in feature_importance.head(10).iterrows():
        f.write(f"{row['feature']:<20}: {row['importance']:.4f}\n")

print(f"✅ Metrics saved to api/model_metrics.txt")

print("\n🎉 Model training completed successfully!")
print("=" * 60)
print("📋 Summary:")
print(f"   • Model achieved {f1:.4f} F1-score")
print(f"   • Can detect {recall:.1%} of delayed flights")
print(f"   • False alarm rate: {fp/(fp+tn):.1%}")
print(f"   • Model saved and ready for deployment!")