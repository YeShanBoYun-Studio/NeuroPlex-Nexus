#!/bin/bash
set -e

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python is installed
if ! command_exists python; then
    echo "Python is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo "Node.js is not installed"
    exit 1
fi

# Create and activate virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
    source venv/bin/activate
    pip install -e '.[all]'
else
    source venv/bin/activate
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "Frontend directory not found"
    exit 1
fi

# Set up signal handling
trap 'kill $(jobs -p)' EXIT

# Start frontend development server in background
(cd frontend && npm install && npm run dev) &

# Wait a moment to ensure frontend starts
sleep 2

# Start backend server
echo "Starting backend server..."
python start_app.py
