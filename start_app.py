"""
Development server startup script for NeuraCollab.
"""
import os
import sys
import time
import logging
import asyncio
import uvicorn
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 9):
        logger.error("Python 3.9 or higher is required")
        sys.exit(1)

def check_environment():
    """Check required environment variables."""
    required_vars = ['OPENAI_API_KEY']
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        logger.warning(f"Missing environment variables: {', '.join(missing)}")
        if 'OPENAI_API_KEY' in missing:
            logger.warning("GPT-4 features will be unavailable")

def ensure_directories():
    """Create necessary directories if they don't exist."""
    directories = ['logs', 'cache', 'config/workflows', 'config/models']
    for dir_path in directories:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    logger.info("Directory structure verified")

def check_dependencies():
    """Check and report on missing dependencies."""
    from neuracollab.requires import get_missing_dependencies, print_dependency_report

    missing = get_missing_dependencies()
    if missing.get('web') or missing.get('database'):
        logger.error("Critical dependencies missing!")
        print_dependency_report()
        sys.exit(1)
    elif missing:
        logger.warning("Some optional features may be unavailable")
        print_dependency_report()

async def main():
    """Start the development server with initialization."""
    try:
        logger.info("Starting NeuraCollab development server...")
        logger.info("========================================")

        # Preliminary checks
        check_python_version()
        ensure_directories()
        check_environment()
        check_dependencies()

        # Initialize application
        from neuracollab.init_db import init_app
        init_app()

        # Start server
        logger.info("\nStarting FastAPI server...")
        config = uvicorn.Config(
            "neuracollab.server:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=["neuracollab"],
            log_level="info"
        )
        server = uvicorn.Server(config)
        await server.serve()

    except ImportError as e:
        logger.error(f"Failed to import required module: {e}")
        logger.error("Please install all dependencies with: pip install -e '.[all]'")
        sys.exit(1)
    except KeyboardInterrupt:
        logger.info("\nShutting down gracefully...")
    except Exception as e:
        logger.error(f"Failed to start server: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("\nShutting down gracefully...")
        sys.exit(0)
