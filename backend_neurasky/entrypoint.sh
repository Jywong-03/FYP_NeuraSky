#!/bin/sh
set -e

echo "Running Database Migrations..."
# Try to migrate, but don't fail properly (or strictly fail? strict fail is better for consistency)
# We use a loop to wait for DB if needed, though 'depends_on' in Docker Compose usually handles order, 
# 'depends_on' doesn't wait for the DB port to be ready.
# Simulating wait-for-it
echo "Waiting for MySQL to be ready..."
timeout=60
while ! python -c "import socket, os; s=socket.socket(socket.AF_INET, socket.SOCK_STREAM); s.settimeout(1); s.connect(('${DB_HOST}', 3306))" 2>/dev/null; do
  if [ $timeout -le 0 ]; then
    echo "Timed out waiting for MySQL"
    exit 1
  fi
  echo "Waiting for MySQL... ($timeout s)"
  sleep 2
  timeout=$((timeout-2))
done

echo "MySQL is up - executing migrations"
python manage.py migrate

echo "Starting Gunicorn..."
# Use a larger timeout (60s) to allow for model loading if needed
exec gunicorn neurasky_backend.wsgi:application --bind 0.0.0.0:8000 --timeout 60 --workers 3
