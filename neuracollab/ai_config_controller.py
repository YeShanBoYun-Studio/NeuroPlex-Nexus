"""
Controller for managing AI model configurations.
"""
import logging
from typing import Dict, List
from fastapi import APIRouter, HTTPException

from .ai_config import AIModelConfig, AIConfigManager
from .adapters.llm_adapters import create_adapter
from .dispatcher import LLMDispatcher

logger = logging.getLogger(__name__)
router = APIRouter()

def get_ai_config_controller(config_manager: AIConfigManager, dispatcher: LLMDispatcher):
    """Create a router with AI configuration management endpoints."""

    @router.get("/")
    async def list_ai_configs() -> List[AIModelConfig]:
        """List all AI configurations."""
        try:
            return config_manager.list_configs()
        except Exception as e:
            logger.error(f"Failed to list AI configs: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/")
    async def save_ai_config(config: AIModelConfig) -> AIModelConfig:
        """Save an AI configuration."""
        try:
            # Validate and save config
            config_manager.save_config(config)

            # If active, register the adapter
            if config.is_active:
                adapter = create_adapter(config.provider, config.credentials)
                dispatcher.register_adapter(config.name, adapter)

            return config
        except Exception as e:
            logger.error(f"Failed to save AI config: {e}")
            raise HTTPException(status_code=400, detail=str(e))

    @router.get("/{name}")
    async def get_ai_config(name: str) -> AIModelConfig:
        """Get a specific AI configuration."""
        config = config_manager.get_config(name)
        if not config:
            raise HTTPException(status_code=404, detail="Configuration not found")
        return config

    @router.delete("/{name}")
    async def delete_ai_config(name: str) -> Dict[str, str]:
        """Delete an AI configuration."""
        try:
            if config_manager.delete_config(name):
                # Reset and reload adapters
                dispatcher.reset()
                # Reload active configurations
                for config in config_manager.list_configs():
                    if config.is_active:
                        adapter = create_adapter(config.provider, config.credentials)
                        dispatcher.register_adapter(config.name, adapter)
                return {"status": "success", "message": f"Configuration {name} deleted"}
            raise HTTPException(status_code=404, detail="Configuration not found")
        except Exception as e:
            logger.error(f"Failed to delete AI config: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/test")
    async def test_ai_config(config: AIModelConfig) -> Dict[str, any]:
        """Test an AI configuration."""
        try:
            # Create adapter without registering
            adapter = create_adapter(config.provider, config.credentials)
            is_available = adapter.is_available()

            # Try a basic generation if available
            test_details = None
            if is_available:
                try:
                    test_result = await adapter.generate(
                        "This is a test prompt.",
                        max_tokens=10
                    )
                    test_details = {
                        "response": "Model responded successfully",
                        "sample": test_result[:50] if test_result else None
                    }
                except Exception as e:
                    test_details = {"error": str(e)}

            return {
                "success": is_available,
                "provider": config.provider,
                "error": None if is_available else "Connection test failed",
                "details": test_details
            }
        except Exception as e:
            logger.error(f"Config test failed: {e}")
            return {
                "success": False,
                "provider": config.provider,
                "error": str(e),
                "details": None
            }

    @router.patch("/{name}/toggle")
    async def toggle_ai_config(name: str, active: bool) -> AIModelConfig:
        """Toggle an AI configuration active state."""
        try:
            config = config_manager.get_config(name)
            if not config:
                raise HTTPException(status_code=404, detail="Configuration not found")

            config.is_active = active
            config_manager.save_config(config)

            if active:
                adapter = create_adapter(config.provider, config.credentials)
                dispatcher.register_adapter(config.name, adapter)
            else:
                dispatcher.remove_adapter(config.name)

            return config
        except Exception as e:
            logger.error(f"Failed to toggle AI config: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/available-models")
    async def list_available_models() -> Dict[str, List[str]]:
        """List available models for each provider."""
        try:
            models = {
                "openai": ["gpt-4", "gpt-3.5-turbo"],
                "azure": ["gpt-4", "gpt-35-turbo"],
                "ollama": ["llama2", "mistral", "codellama"],
                "anthropic": ["claude-3-opus", "claude-3-sonnet", "claude-2.1"],
                "huggingface": []  # Dynamically populated based on API query
            }
            return models
        except Exception as e:
            logger.error(f"Failed to list available models: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router
