"""
Optional dependencies management for NeuraCollab.
"""
import importlib
from typing import Dict, List, Optional

def check_dependency(package: str) -> bool:
    """Check if a Python package is installed."""
    try:
        importlib.import_module(package)
        return True
    except ImportError:
        return False

def get_missing_dependencies() -> Dict[str, List[str]]:
    """
    Check for missing optional dependencies.
    Returns a dictionary of feature categories and their missing dependencies.
    """
    missing = {
        "openai": [],
        "ollama": [],
        "compression": [],
        "database": [],
        "web": []
    }

    # OpenAI features
    if not check_dependency("openai"):
        missing["openai"].append("openai")

    # Ollama features
    if not check_dependency("httpx"):
        missing["ollama"].append("httpx")
    if not check_dependency("requests"):
        missing["ollama"].append("requests")

    # Compression features
    if not check_dependency("nltk"):
        missing["compression"].append("nltk")
    if not check_dependency("numpy"):
        missing["compression"].append("numpy")

    # Database features
    if not check_dependency("aiosqlite"):
        missing["database"].append("aiosqlite")
    if not check_dependency("sqlalchemy"):
        missing["database"].append("sqlalchemy")

    # Web features
    if not check_dependency("fastapi"):
        missing["web"].append("fastapi")
    if not check_dependency("uvicorn"):
        missing["web"].append("uvicorn")
    if not check_dependency("websockets"):
        missing["web"].append("websockets")

    # Remove empty categories
    return {k: v for k, v in missing.items() if v}

def get_install_command(feature: str) -> Optional[str]:
    """Get pip install command for a specific feature."""
    commands = {
        "openai": "pip install openai>=1.0.0",
        "ollama": "pip install httpx>=0.24.0 requests>=2.31.0",
        "compression": "pip install nltk>=3.8.0 numpy>=1.24.0",
        "database": "pip install aiosqlite>=0.19.0 sqlalchemy>=2.0.0",
        "web": "pip install fastapi>=0.100.0 uvicorn[standard]>=0.20.0 websockets>=11.0.0"
    }
    return commands.get(feature)

def print_dependency_report():
    """Print a report of missing dependencies and installation instructions."""
    missing = get_missing_dependencies()
    
    if not missing:
        print("✓ All dependencies are satisfied")
        return

    print("\nMissing Dependencies Report:")
    print("============================")
    
    for feature, deps in missing.items():
        print(f"\n{feature.upper()} Features:")
        print(f"Missing: {', '.join(deps)}")
        if cmd := get_install_command(feature):
            print(f"Install with: {cmd}")

    print("\nInstall all dependencies with:")
    print("pip install -e '.[all]'")

if __name__ == "__main__":
    print_dependency_report()
