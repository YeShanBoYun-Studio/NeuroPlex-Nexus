"""
Pytest configuration and fixtures for NeuraCollab tests.
"""
import os
import pytest
import tempfile
from typing import Generator
from pathlib import Path
from fastapi.testclient import TestClient

from neuracollab.server import app
from neuracollab.init_db import init_database
from neuracollab.cache_pool import NeuralCachePool
from neuracollab.engine import CollaborationEngine
from neuracollab.dispatcher import LLMDispatcher
from neuracollab.ai_config import AIConfigManager

@pytest.fixture(scope="session")
def test_app():
    """Create a test version of the FastAPI application."""
    return app

@pytest.fixture(scope="session")
def client(test_app) -> Generator:
    """Create a test client."""
    with TestClient(test_app) as client:
        yield client

@pytest.fixture(scope="session")
def temp_base_dir():
    """Create a temporary directory for test data."""
    with tempfile.TemporaryDirectory() as temp_dir:
        # Set up test directories
        config_dir = Path(temp_dir) / "config"
        cache_dir = Path(temp_dir) / "cache"
        logs_dir = Path(temp_dir) / "logs"

        config_dir.mkdir()
        cache_dir.mkdir()
        logs_dir.mkdir()

        # Set environment variables for test
        os.environ['NEURACOLLAB_CONFIG_DIR'] = str(config_dir)
        os.environ['NEURACOLLAB_CACHE_DIR'] = str(cache_dir)
        os.environ['NEURACOLLAB_LOGS_DIR'] = str(logs_dir)
        os.environ['NEURACOLLAB_ENV'] = 'test'

        yield temp_dir

@pytest.fixture(scope="session")
def test_db(temp_base_dir):
    """Initialize test database."""
    db_path = Path(temp_base_dir) / "test.db"
    os.environ['NEURACOLLAB_DB_URL'] = f"sqlite:///{db_path}"
    init_database()
    return db_path

@pytest.fixture
def cache_pool():
    """Create a test cache pool."""
    return NeuralCachePool(max_size_mb=10)

@pytest.fixture
def dispatcher():
    """Create a test LLM dispatcher."""
    return LLMDispatcher()

@pytest.fixture
def ai_config(temp_base_dir):
    """Create a test AI config manager."""
    config_dir = Path(temp_base_dir) / "config" / "ai"
    return AIConfigManager(config_dir=str(config_dir))

@pytest.fixture
def engine(cache_pool):
    """Create a test collaboration engine."""
    return CollaborationEngine(cache_pool)

@pytest.fixture
def test_workflow(client) -> str:
    """Create a test workflow and return its ID."""
    response = client.post(
        "/workflows/create",
        json={
            "name": "test_workflow",
            "mode": "test",
            "initial_content": "Test content",
            "config": {
                "prompt_template": "Test template",
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
        }
    )
    assert response.status_code == 200
    data = response.json()
    return data["workflow_id"]

@pytest.fixture
def test_ai_config(client) -> str:
    """Create a test AI configuration and return its name."""
    config = {
        "provider": "openai",
        "name": "test_gpt4",
        "credentials": {
            "api_key": "test_key",
            "model_name": "gpt-4"
        },
        "is_active": True,
        "priority": 1
    }
    response = client.post("/ai/configs", json=config)
    assert response.status_code == 200
    return config["name"]

class MockWebSocket:
    """Mock WebSocket for testing."""
    def __init__(self):
        self.sent_messages = []
        self.closed = False

    async def accept(self):
        pass

    async def send_json(self, data):
        self.sent_messages.append(data)

    async def receive_json(self):
        return {"type": "test_message"}

    async def close(self):
        self.closed = True

@pytest.fixture
def mock_websocket():
    """Create a mock WebSocket."""
    return MockWebSocket()

def pytest_configure(config):
    """Configure pytest for the test session."""
    # Register custom markers
    config.addinivalue_line("markers", "slow: mark test as slow to run")
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "websocket: mark test as WebSocket test")

def pytest_collection_modifyitems(config, items):
    """Modify test collection."""
    # Add markers based on test location/name
    for item in items:
        if "integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)
        if "slow" in item.nodeid:
            item.add_marker(pytest.mark.slow)
        if "websocket" in item.nodeid:
            item.add_marker(pytest.mark.websocket)
