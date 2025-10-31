# backend_neurasky/app.py
from flask import Flask, jsonify, request # Added request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy  # Import SQLAlchemy
from passlib.context import CryptContext # Import Passlib for hashing

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# --- Database Configuration ---
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')

# Ensure all DB environment variables are set
if not all([db_user, db_password, db_host, db_name]):
    print("ERROR: Database environment variables (DB_USER, DB_PASSWORD, DB_HOST, DB_NAME) are not fully set.")
    # You might want to exit or raise an error here in a real app
    # For now, we'll print a warning
    # exit(1) # Uncomment to stop if config is missing

app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy with the Flask app
db = SQLAlchemy(app)

# --- Password Hashing Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Define User Model ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False) # Store hashed password

    def set_password(self, password):
        """Hashes the password."""
        self.password_hash = pwd_context.hash(password)

    def check_password(self, password):
        """Checks if the provided password matches the stored hash."""
        return pwd_context.verify(password, self.password_hash)

    def __repr__(self):
        return f'<User {self.email}>'

# --- Basic Test Route ---
@app.route('/api/ping', methods=['GET'])
def ping_pong():
    return jsonify(message='pong!')

# --- Example: Add User Route (for testing, implement properly later) ---
@app.route('/api/test_add_user', methods=['POST'])
def test_add_user():
    # WARNING: Very basic example, no real validation!
    data = request.get_json()
    if not data or not 'name' in data or not 'email' in data or not 'password' in data:
        return jsonify({"error": "Missing data"}), 400

    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"error": "Email already exists"}), 409

    new_user = User(name=data['name'], email=data['email'])
    new_user.set_password(data['password']) # Hash the password

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"User {new_user.name} created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- Create Database Tables (Run once initially) ---
# It's better to use Flask-Migrate for managing db changes later,
# but this works for the initial setup.
with app.app_context():
    print("Attempting to create database tables...")
    try:
        db.create_all()
        print("Tables created successfully (if they didn't exist).")
    except Exception as e:
        print(f"Error creating tables: {e}")
        print("Please ensure your database server is running and credentials in .env are correct.")


# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)