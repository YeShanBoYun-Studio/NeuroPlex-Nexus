"""
LLM adapters for different AI model providers.
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import logging
import importlib

logger = logging.getLogger(__name__)

class LLMAdapter(ABC):
    """Base class for LLM adapters."""
    
    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text from prompt."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if the model is available."""
        pass

class OpenAIGPT4Adapter(LLMAdapter):
    """Adapter for OpenAI's GPT-4 model."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self._openai = None
        self._available = False
        self._initialize()

    def _initialize(self) -> None:
        """Initialize OpenAI client."""
        try:
            openai = importlib.import_module('openai')
            if self.api_key:
                self._openai = openai.OpenAI(api_key=self.api_key)
                self._available = True
                logger.info("OpenAI GPT-4 adapter initialized successfully")
            else:
                logger.warning("No API key provided for OpenAI GPT-4 adapter")
        except ImportError:
            logger.warning("OpenAI package not installed. GPT-4 features will be unavailable")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")

    def is_available(self) -> bool:
        return self._available and self._openai is not None

    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text using GPT-4."""
        if not self.is_available():
            raise RuntimeError("OpenAI GPT-4 adapter is not available")

        try:
            response = await self._openai.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI generation error: {e}")
            raise

class OllamaAdapter(LLMAdapter):
    """Adapter for local Ollama models."""
    
    def __init__(self, model: str = "llama3"):
        self.model = model
        self._available = False
        self._initialize()

    def _initialize(self) -> None:
        """Initialize Ollama client."""
        try:
            # Check if Ollama service is running
            import requests
            response = requests.get("http://localhost:11434/api/version")
            if response.status_code == 200:
                self._available = True
                logger.info(f"Ollama adapter initialized successfully with model {self.model}")
            else:
                logger.warning("Ollama service is not running")
        except Exception as e:
            logger.warning(f"Failed to initialize Ollama adapter: {e}")

    def is_available(self) -> bool:
        return self._available

    async def generate(self, prompt: str, **kwargs) -> str:
        """Generate text using Ollama."""
        if not self.is_available():
            raise RuntimeError("Ollama adapter is not available")

        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        **kwargs
                    }
                )
                response.raise_for_status()
                return response.json()["response"]
        except Exception as e:
            logger.error(f"Ollama generation error: {e}")
            raise

class FallbackAdapter(LLMAdapter):
    """Simple fallback adapter for testing."""
    
    def __init__(self):
        self._available = True

    def is_available(self) -> bool:
        return True

    async def generate(self, prompt: str, **kwargs) -> str:
        """Return a simple response for testing."""
        return f"[Test Response] Input length: {len(prompt)} chars"

def create_adapter(provider: str, config: Dict[str, Any]) -> LLMAdapter:
    """Create an adapter instance based on provider and config."""
    if provider == "openai":
        return OpenAIGPT4Adapter(config.get("api_key"))
    elif provider == "ollama":
        return OllamaAdapter(config.get("model", "llama3"))
    else:
        logger.warning(f"Unknown provider {provider}, using fallback adapter")
        return FallbackAdapter()
