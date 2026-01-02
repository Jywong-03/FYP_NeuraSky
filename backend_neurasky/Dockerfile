# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables to prevent Python from buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies (needed for MySQL and potential ML libraries)
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    libgomp1 \
    curl \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Expose the port Django runs on
EXPOSE 8000

# Make entrypoint executable and fix line endings
COPY entrypoint.sh /app/
RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Set Entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
