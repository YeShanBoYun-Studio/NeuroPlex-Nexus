import subprocess
import sys
import time
import webbrowser
import os
from pathlib import Path

def check_dependencies():
    """Check and install required dependencies"""
    print("Checking dependencies...")
    
    # Install Python dependencies
    subprocess.check_call([
        sys.executable, "-m", "pip", "install", "-e", ".[dev]"
    ])
    
    # Set up NLTK data
    try:
        import nltk
        nltk.download('punkt', quiet=True)
    except Exception as e:
        print(f"Warning: Could not download NLTK data: {e}")
    
    # Install frontend dependencies
    frontend_dir = Path(__file__).parent / "frontend"
    if not (frontend_dir / "node_modules").exists():
        print("Installing frontend dependencies...")
        subprocess.check_call(
            ["npm", "install"],
            cwd=str(frontend_dir),
            shell=True
        )

def start_backend():
    """Start the FastAPI backend server"""
    print("Starting backend server...")
    backend_process = subprocess.Popen([
        sys.executable, "-m", "uvicorn", 
        "neuracollab.server:app", "--host", "0.0.0.0", "--port", "8000"
    ])
    return backend_process

def start_frontend():
    """Start the React frontend development server"""
    print("Starting frontend server...")
    frontend_dir = Path(__file__).parent / "frontend"
    frontend_process = subprocess.Popen([
        "npm", "run", "dev"
    ], cwd=str(frontend_dir), shell=True)
    return frontend_process

def main():
    """Start both servers and open the application in the default browser"""
    try:
        # Check and install dependencies
        check_dependencies()
        
        # Start backend
        backend_process = start_backend()
        print("Backend server started at http://localhost:8000")
        
        # Give the backend a moment to start
        time.sleep(2)
        
        # Start frontend
        frontend_process = start_frontend()
        print("Frontend server started at http://localhost:5173")
        
        # Give the frontend a moment to start
        time.sleep(3)
        
        # Open the application in the default browser
        webbrowser.open("http://localhost:5173")
        
        print("\nNeuraCollab is running!")
        print("Press Ctrl+C to stop all servers")
        
        # Wait for processes to complete (or for KeyboardInterrupt)
        backend_process.wait()
        frontend_process.wait()
        
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        
        try:
            backend_process.wait(timeout=5)
            frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()
            frontend_process.kill()
        
        print("Servers stopped")
    
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
