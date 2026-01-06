# NeuraSky - AI-Powered Flight Intelligence System ✈️

NeuraSky is an advanced flight tracking application developed as a Final Year Project (FYP). It leverages Machine Learning to predict flight delays and offers a suite of utility features for passengers.

## 🌟 Key Features

### 🧠 AI Risk Analysis

- **Predictive Modeling**: Uses historical data and real-time factors (weather, peak hours) to forecast delay probability.
- **Risk Badges**: Visual indicators (High/Medium/Low) on flight cards help users plan ahead.

### 🗺️ Live Flight Map

- **Real-time Visualization**: Interactive map showing flight paths.
- **Simulation Mode**: A demo-ready feature that animates planes for presentation purposes.

### 📄 Passenger Utilities

- **Delay Certificates**: Generates official PDF documents for travel insurance claims.
- **Calendar Sync**: One-click export to Google/Apple Calendar.
- **Smart Sharing**: Easy status sharing via clipboard.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Leaflet Maps.
- **Backend**: Django REST Framework, Python.
- **AI/ML**: Scikit-learn, Pandas, Joblib.
- **Database**: MySQL (Production), SQLite (Testing).
- **Infrastructure**: Docker, AWS (EC2/RDS compatible).

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Backend Setup

```bash
cd backend_neurasky
python -m venv venv
# Windows
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Run Migrations
python manage.py migrate
# Start Server
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend_neurasky
npm install
npm run dev
```

### 3. Running Tests

To verify the system integrity:

```bash
cd backend_neurasky
python manage.py test api
```

---

## 📝 License

Academic Use Only.
