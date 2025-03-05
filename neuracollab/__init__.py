"""
NeuraCollab: A collaborative AI writing and debate platform.
"""

__version__ = "0.1.0"

# Import core components for easy access
from .adapters.llm_adapters import (
    LLMAdapter,
    OpenAIGPT4Adapter,
    OllamaAdapter,
    FallbackAdapter,
    create_adapter
)
from .dispatcher import LLMDispatcher
from .engine import CollaborationEngine
from .cache_pool import NeuralCachePool

# Setup logging
import logging
logging.getLogger(__name__).addHandler(logging.NullHandler())

def create_app():
    """Create and configure a new FastAPI application instance."""
    from .server import app
    return app
