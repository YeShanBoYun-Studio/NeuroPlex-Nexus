"""
Development environment setup and launcher for NeuraCollab.
"""
import os
import sys
import subprocess
import threading
import webbrowser
import time
import platform
from pathlib import Path

def run_frontend():
    """Run the frontend development server."""
    os.chdir("frontend")
    subprocess.run(["npm", "run", "dev"], check=True)

def run_backend():
    """Run the backend development server."""
    if platform.system() == "Windows":
        venv_python = os.path.join("venv", "Scripts", "python")
    else:
        venv_python = os.path.join("venv", "bin", "python")
    subprocess.run([venv_python, "start_app.py"], check=True)

def setup_frontend():
    """Setup frontend development environment."""
    os.chdir("frontend")
    if not os.path.exists("node_modules"):
        print("Installing frontend dependencies...")
        subprocess.run(["npm", "install"], check=True)
    os.chdir("..")

def activate_venv():
    """Activate virtual environment and return the correct Python and pip paths."""
    if platform.system() == "Windows":
        python = os.path.join(os.getcwd(), "venv", "Scripts", "python")
        pip = os.path.join(os.getcwd(), "venv", "Scripts", "pip")
    else:
        python = os.path.join(os.getcwd(), "venv", "bin", "python")
        pip = os.path.join(os.getcwd(), "venv", "bin", "pip")
    return python, pip

def setup_backend():
    """Setup backend development environment."""
    try:
        if not os.path.exists("venv"):
            print("Creating Python virtual environment...")
            subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)

        python, pip = activate_venv()

        print("Upgrading pip...")
        subprocess.run([pip, "install", "--upgrade", "pip"], check=True)

        print("Installing dependencies from requirements.txt...")
        subprocess.run([pip, "install", "-r", "requirements.txt"], check=True)

        # Check package installations
        subprocess.run([python, "-c", "import openai"], check=True)
        print("✓ OpenAI package installed successfully")
        
        subprocess.run([python, "-c", "import fastapi"], check=True)
        print("✓ FastAPI package installed successfully")
        
    except subprocess.CalledProcessError as e:
        print(f"Error during backend setup: {e}")
        sys.exit(1)

def setup_env():
    """Setup environment files if they don't exist."""
    if not os.path.exists(".env"):
        print("Creating .env file...")
        with open(".env", "w") as f:
            f.write("""# API Keys
OPENAI_API_KEY=your-api-key-here

# Server Settings
HOST=0.0.0.0
PORT=8000
DEBUG=true
""")
        print("! Please edit .env and add your OpenAI API key")

    if not os.path.exists("frontend/.env"):
        print("Creating frontend .env file...")
        with open("frontend/.env", "w") as f:
            f.write("""VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_DEFAULT_LANGUAGE=en
""")

def create_directories():
    """Create necessary project directories."""
    directories = [
        "logs",
        "cache",
        "config/workflows",
        "config/models",
    ]
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    print("✓ Project directories created")

def verify_setup():
    """Verify all components are properly set up."""
    python, _ = activate_venv()
    
    checks = [
        (os.path.exists("venv"), "Virtual environment exists"),
        (os.path.exists("requirements.txt"), "Requirements file exists"),
        (os.path.exists(".env"), "Environment file exists"),
        (os.path.exists("frontend/node_modules"), "Frontend dependencies installed"),
        (os.path.exists("neuracollab.db"), "Database file exists"),
    ]
    
    all_passed = True
    for check, message in checks:
        if check:
            print(f"✓ {message}")
        else:
            print(f"✗ {message}")
            all_passed = False
    
    return all_passed

def main():
    """Main development setup and launch function."""
    try:
        # Ensure we're in the project root
        if not all(os.path.exists(d) for d in ["frontend", "neuracollab"]):
            print("Error: Please run this script from the project root directory")
            sys.exit(1)

        # Setup environments
        print("\nSetting up development environment...")
        print("====================================")
        
        create_directories()
        setup_env()
        setup_backend()
        setup_frontend()

        print("\nVerifying setup...")
        print("==================")
        if not verify_setup():
            print("\n! Some components are not properly set up")
            if input("Continue anyway? (y/N): ").lower() != 'y':
                sys.exit(1)

        print("\nStarting development servers...")
        print("=============================")
        
        # Start backend server in a separate thread
        backend_thread = threading.Thread(target=run_backend)
        backend_thread.daemon = True
        backend_thread.start()

        # Wait for backend to start
        time.sleep(2)
        print("\nOpening browser...")
        webbrowser.open("http://localhost:5173")

        # Start frontend (this will block)
        run_frontend()

    except KeyboardInterrupt:
        print("\nShutting down development servers...")
    except subprocess.CalledProcessError as e:
        print(f"\nError running command: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
