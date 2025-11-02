import os
import jwt
import datetime
from functools import wraps
from flask import Flask, jsonify, request, g
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from passlib.context import CryptContext

# --- App Initialization & Config ---

load_dotenv()

app = Flask(__name__)

# Enable CORS for your React frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# --- Secret Key ---
# Make sure to set this in your .env file!
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise ValueError("No SECRET_KEY set. Run 'python -c \"import os; print(os.urandom(24).hex())\"' to generate one.")

# --- Database Configuration (MS SQL Server) ---
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST') # e.g., 'localhost' or 'SERVER_NAME\\SQLEXPRESS'
db_name = os.getenv('DB_NAME')
db_driver = os.getenv('DB_DRIVER', 'ODBC Driver 17 for SQL Server') 

if not all([db_user, db_password, db_host, db_name, db_driver]):
    print("Warning: Database environment variables are not fully set.")

# MS SQL Server Connection String
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f'mssql+pyodbc://{db_user}:{db_password}@{db_host}/{db_name}?'
    f'driver={db_driver.replace(" ", "+")}' # URL-encode the driver name
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Password Hashing Setup ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- Database Models ---

class User(db.Model):
    """User model for storing user accounts."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False) # Increased size for hash

    def set_password(self, password):
        """Hashes the password."""
        self.password_hash = pwd_context.hash(password)

    def check_password(self, password):
        """Checks if the provided password matches the stored hash."""
        return pwd_context.verify(password, self.password_hash)

    def __repr__(self):
        return f'<User {self.email}>'

    def to_dict(self):
        """Returns user data as a dictionary (safe to send as JSON)."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email
        }

# --- Authentication Decorator ---

def token_required(f):
    """A decorator to protect routes that require authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check for 'Authorization' header
        if 'Authorization' in request.headers:
            try:
                # Header format is: "Bearer <token>"
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid Authorization header format!'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Decode the token using the app's SECRET_KEY
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # Find the user specified in the token
            current_user = User.query.get(data['user_id'])
            if current_user is None:
                return jsonify({'message': 'User not found!'}), 401
            
            # Store the user in Flask's global 'g' object for this request
            g.current_user = current_user

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        # Pass execution to the original route function
        return f(*args, **kwargs)
    return decorated


# --- API Routes ---

@app.route('/api/ping', methods=['GET'])
def ping_pong():
    """A simple route to check if the API is running."""
    return jsonify(message='pong!')

@app.route('/api/register', methods=['POST'])
def register_user():
    """Handles new user registration."""
    data = request.get_json()
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing name, email, or password"}), 400

    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email address already in use"}), 409

    # Create new user
    new_user = User(name=data['name'], email=data['email'])
    new_user.set_password(data['password'])

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"User {new_user.name} created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login_user():
    """Handles user login and returns a JWT token."""
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()

    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    # Create the JWT token
    payload = {
        'user_id': user.id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1) # Token valid for 1 day
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user.to_dict() # Send user info back to frontend
    }), 200

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile():
    """A protected route to get the current user's profile."""
    # g.current_user is set by the @token_required decorator
    current_user = g.current_user 
    return jsonify(current_user.to_dict()), 200


# --- Create Database Tables ---
# This block will run once when the app starts
# and create any tables that don't exist.
try:
    with app.app_context():
        print("Attempting to create database tables...")
        db.create_all()
        print("Tables checked/created successfully.")
except Exception as e:
    print(f"Error connecting to database or creating tables: {e}")
    print("Please ensure your database server is running and credentials in .env are correct.")
    # In a real app, you might want to exit if the DB connection fails
    # exit(1)


# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)

