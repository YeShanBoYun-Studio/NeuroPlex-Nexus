#!/bin/bash

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install backend dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
    source venv/bin/activate
    pip install -e '.[all]'
else
    source venv/bin/activate
fi

# Start frontend development server
(cd frontend && (command_exists pnpm && pnpm install || npm install) && npm run dev) &

# Start backend server
python start_app.py
