"""
Test utilities for NeuraCollab tests.
"""
import asyncio
import json
from typing import Any, Dict, Optional, List
from pathlib import Path
from uuid import UUID

def load_test_data(name: str) -> Dict[str, Any]:
    """Load test data from JSON files."""
    data_path = Path(__file__).parent / "data" / f"{name}.json"
    if data_path.exists():
        return json.loads(data_path.read_text())
    return {}

def create_test_config(
    provider: str = "openai",
    name: str = "test_config",
    is_active: bool = True
) -> Dict[str, Any]:
    """Create a test AI configuration."""
    return {
        "provider": provider,
        "name": name,
        "credentials": {
            "api_key": "test_key",
            "model_name": f"test_{provider}_model"
        },
        "is_active": is_active,
        "priority": 1,
        "rate_limit": None
    }

def create_test_workflow(
    name: str = "test_workflow",
    mode: str = "relay",
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a test workflow configuration."""
    default_config = {
        "prompt_template": "Test prompt template",
        "inheritance_rules": {
            "full_history": False,
            "last_3_steps": True,
            "prompt_chain": True
        },
        "termination_conditions": {
            "max_steps": 5,
            "inactivity_timeout": 300
        }
    }
    
    return {
        "name": name,
        "mode": mode,
        "initial_content": "Test initial content",
        "config": config or default_config
    }

async def wait_for_workflow_completion(
    client: Any,
    workflow_id: UUID,
    timeout: int = 30,
    check_interval: float = 0.5
) -> bool:
    """Wait for a workflow to complete or timeout."""
    start_time = asyncio.get_event_loop().time()
    while asyncio.get_event_loop().time() - start_time < timeout:
        response = await client.get(f"/workflows/{workflow_id}/status")
        if response.status_code == 200:
            status = response.json()
            if status["state"] in ["completed", "error", "terminated"]:
                return True
        await asyncio.sleep(check_interval)
    return False

def create_test_branch_config(
    base_id: UUID,
    prompt: str = "Test branch prompt",
    config: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a test branch configuration."""
    return {
        "base_id": str(base_id),
        "prompt": prompt,
        "config": config or {
            "inheritance_type": "full",
            "custom_settings": {}
        }
    }

class AsyncTestContext:
    """Context manager for async tests."""
    def __init__(self):
        self.tasks: List[asyncio.Task] = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # Cancel any pending tasks
        for task in self.tasks:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

    def create_task(self, coro):
        """Create and track an async task."""
        task = asyncio.create_task(coro)
        self.tasks.append(task)
        return task

def get_test_cache_settings(
    max_size_mb: int = 100,
    compression_enabled: bool = True,
    compression_threshold: float = 0.7
) -> Dict[str, Any]:
    """Get test cache settings."""
    return {
        "max_size_mb": max_size_mb,
        "compression_enabled": compression_enabled,
        "compression_threshold": compression_threshold
    }

def compare_workflows(workflow1: Dict[str, Any], workflow2: Dict[str, Any]) -> bool:
    """Compare two workflow configurations for equality."""
    essential_keys = ["name", "mode", "config"]
    return all(
        workflow1.get(key) == workflow2.get(key)
        for key in essential_keys
    )

def sanitize_response(response: Dict[str, Any]) -> Dict[str, Any]:
    """Remove non-deterministic fields from response data."""
    sanitized = response.copy()
    # Remove timestamps, IDs, etc.
    for key in ['timestamp', 'created_at', 'updated_at', 'id']:
        sanitized.pop(key, None)
    return sanitized

def create_test_message(
    message_type: str,
    content: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Create a test WebSocket message."""
    return {
        "type": message_type,
        "data": content or {},
        "timestamp": "2025-01-01T00:00:00Z"  # Fixed timestamp for testing
    }
