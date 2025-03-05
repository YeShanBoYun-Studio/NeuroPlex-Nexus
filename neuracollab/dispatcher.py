"""
Model dispatcher for managing and routing requests to different LLM adapters.
"""
import logging
from typing import Dict, Optional
from .adapters.llm_adapters import LLMAdapter, create_adapter, FallbackAdapter

logger = logging.getLogger(__name__)

class LLMDispatcher:
    """
    Manages multiple LLM adapters and routes requests to appropriate models.
    """
    
    def __init__(self):
        self._adapters: Dict[str, LLMAdapter] = {}
        self._default_adapter = FallbackAdapter()
        logger.info("LLM Dispatcher initialized with fallback adapter")

    def register_adapter(self, name: str, adapter: LLMAdapter) -> None:
        """Register a new model adapter."""
        if adapter.is_available():
            self._adapters[name] = adapter
            logger.info(f"Registered adapter: {name}")
        else:
            logger.warning(f"Adapter {name} is not available, skipping registration")

    def register_adapter_from_config(self, name: str, provider: str, config: dict) -> None:
        """Create and register an adapter from configuration."""
        try:
            adapter = create_adapter(provider, config)
            self.register_adapter(name, adapter)
        except Exception as e:
            logger.error(f"Failed to create adapter {name} with provider {provider}: {e}")

    async def dispatch(self, prompt: str, model_name: Optional[str] = None, **kwargs) -> str:
        """
        Dispatch a generation request to the specified model or fallback.
        
        Args:
            prompt: The input text to process
            model_name: Name of the model to use, or None for default
            **kwargs: Additional model-specific parameters
        
        Returns:
            Generated text response
        """
        selected_adapter = None

        if model_name and model_name in self._adapters:
            selected_adapter = self._adapters[model_name]
            if not selected_adapter.is_available():
                logger.warning(f"Selected model {model_name} is not available")
                selected_adapter = None

        if not selected_adapter:
            # Try to find any available adapter
            for name, adapter in self._adapters.items():
                if adapter.is_available():
                    selected_adapter = adapter
                    logger.info(f"Using alternate model: {name}")
                    break

        # If no adapters are available, use fallback
        if not selected_adapter:
            logger.warning("No LLM adapters available, using fallback adapter")
            selected_adapter = self._default_adapter

        try:
            return await selected_adapter.generate(prompt, **kwargs)
        except Exception as e:
            logger.error(f"Generation error with adapter: {e}")
            # If the selected adapter fails, try fallback
            if selected_adapter is not self._default_adapter:
                logger.info("Attempting generation with fallback adapter")
                return await self._default_adapter.generate(prompt, **kwargs)
            raise

    def get_available_models(self) -> Dict[str, bool]:
        """Get a dictionary of registered models and their availability status."""
        return {
            name: adapter.is_available()
            for name, adapter in self._adapters.items()
        }

    def reset(self) -> None:
        """Clear all registered adapters except fallback."""
        self._adapters.clear()
        logger.info("All adapters cleared")
