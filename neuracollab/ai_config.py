"""
AI API configuration management system.
"""
import os
import json
import logging
from typing import Dict, List, Literal, Optional
from pathlib import Path
import asyncio
import httpx
from pydantic import BaseModel, validator, Field
from cryptography.fernet import Fernet

logger = logging.getLogger(__name__)

# Types
ProviderType = Literal["openai", "azure", "ollama", "huggingface", "anthropic"]

class AIModelConfig(BaseModel):
    """Configuration for an AI model provider."""
    provider: ProviderType
    name: str = Field(..., description="Display name for this configuration")
    credentials: Dict[str, str] = Field(default_factory=dict)
    is_active: bool = True
    priority: int = Field(default=1, ge=1, le=100)
    rate_limit: Optional[int] = Field(None, ge=1)
    
    @validator("credentials")
    def validate_credentials(cls, v: Dict[str, str], values: Dict[str, any]) -> Dict[str, str]:
        provider = values.get("provider")
        if not provider:
            return v

        required_fields = {
            "openai": ["api_key", "model_name"],
            "azure": ["api_key", "endpoint", "deployment_name"],
            "ollama": ["base_url", "model_name"],
            "huggingface": ["api_token", "repo_id"],
            "anthropic": ["api_key", "model_name"]
        }

        missing = [field for field in required_fields[provider] if field not in v]
        if missing:
            raise ValueError(f"Missing required fields for {provider}: {', '.join(missing)}")
        return v

class AIConfigManager:
    """Manages AI model configurations with encryption support."""
    
    def __init__(self, config_dir: str = "config/ai"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(parents=True, exist_ok=True)
        self.configs: Dict[str, AIModelConfig] = {}
        self._encryption_key = self._load_or_create_key()
        self._fernet = Fernet(self._encryption_key)
        self._load_configs()

    def _load_or_create_key(self) -> bytes:
        """Load or create encryption key."""
        key_path = self.config_dir / ".key"
        if key_path.exists():
            return key_path.read_bytes()
        else:
            key = Fernet.generate_key()
            key_path.write_bytes(key)
            return key

    def _load_configs(self) -> None:
        """Load all configurations from files."""
        for file in self.config_dir.glob("*.json"):
            try:
                encrypted_data = file.read_bytes()
                data = json.loads(self._fernet.decrypt(encrypted_data))
                config = AIModelConfig(**data)
                self.configs[config.name] = config
            except Exception as e:
                logger.error(f"Failed to load config {file}: {e}")

    def save_config(self, config: AIModelConfig) -> None:
        """Save a configuration securely."""
        try:
            data = config.dict()
            encrypted_data = self._fernet.encrypt(json.dumps(data).encode())
            file_path = self.config_dir / f"{config.name}.json"
            file_path.write_bytes(encrypted_data)
            self.configs[config.name] = config
        except Exception as e:
            logger.error(f"Failed to save config {config.name}: {e}")
            raise

    def get_config(self, name: str) -> Optional[AIModelConfig]:
        """Get a configuration by name."""
        return self.configs.get(name)

    def list_configs(self) -> List[AIModelConfig]:
        """List all configurations."""
        return list(self.configs.values())

    def delete_config(self, name: str) -> bool:
        """Delete a configuration."""
        if name in self.configs:
            try:
                file_path = self.config_dir / f"{name}.json"
                file_path.unlink(missing_ok=True)
                del self.configs[name]
                return True
            except Exception as e:
                logger.error(f"Failed to delete config {name}: {e}")
        return False

    async def test_connection(self, config: AIModelConfig) -> bool:
        """Test the connection to an AI provider."""
        try:
            if config.provider == "openai":
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        "https://api.openai.com/v1/models",
                        headers={"Authorization": f"Bearer {config.credentials['api_key']}"}
                    )
                    response.raise_for_status()
            elif config.provider == "ollama":
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        f"{config.credentials['base_url']}/api/tags"
                    )
                    response.raise_for_status()
            elif config.provider == "huggingface":
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        "https://huggingface.co/api/models",
                        headers={"Authorization": f"Bearer {config.credentials['api_token']}"}
                    )
                    response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Connection test failed for {config.name}: {e}")
            return False

    def get_active_configs(self) -> List[AIModelConfig]:
        """Get all active configurations sorted by priority."""
        return sorted(
            [config for config in self.configs.values() if config.is_active],
            key=lambda x: x.priority
        )

# Global instance
ai_config_manager = AIConfigManager()
