"""
Tests for the NeuraCollab controllers.
"""
import json
import pytest
from fastapi.testclient import TestClient
from pathlib import Path
from unittest.mock import Mock, patch

from .utils import (
    load_test_data,
    create_test_workflow,
    create_test_config,
    get_test_cache_settings,
    AsyncTestContext
)

# Load test data
test_data = load_test_data("samples")

class TestWorkflowController:
    """Tests for the workflow controller."""

    def test_create_workflow(self, client):
        """Test workflow creation."""
        workflow_data = test_data["workflows"]["relay"]
        response = client.post("/workflows/create", json=workflow_data)
        assert response.status_code == 200
        data = response.json()
        assert "workflow_id" in data
        
    def test_get_workflow(self, client, test_workflow):
        """Test getting workflow details."""
        response = client.get(f"/workflows/{test_workflow}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "test_workflow"

    def test_workflow_execution(self, client, test_workflow):
        """Test workflow step execution."""
        # Add input
        response = client.post(
            f"/workflows/{test_workflow}/input",
            params={"content": "Test input"}
        )
        assert response.status_code == 200

        # Execute step
        response = client.post(f"/workflows/{test_workflow}/step")
        assert response.status_code == 200
        data = response.json()
        assert "entry_id" in data

class TestCacheController:
    """Tests for the cache controller."""

    def test_cache_settings(self, client):
        """Test cache settings management."""
        settings = test_data["cache_settings"]["standard"]
        
        # Update settings
        response = client.post("/cache/settings", json=settings)
        assert response.status_code == 200
        
        # Get settings
        response = client.get("/cache/settings")
        assert response.status_code == 200
        data = response.json()
        assert data["max_size_mb"] == settings["max_size_mb"]
        
    def test_cache_stats(self, client):
        """Test cache statistics."""
        response = client.get("/cache/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_entries" in data
        assert "size_mb" in data

    @pytest.mark.integration
    def test_cache_optimization(self, client):
        """Test cache optimization."""
        response = client.post("/cache/optimize")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data

class TestBranchController:
    """Tests for the branch controller."""

    def test_create_branch(self, client, test_workflow):
        """Test branch creation."""
        branch_data = {
            "base_id": test_workflow,
            "prompt": "Test branch",
            "config": {}
        }
        response = client.post("/branches/create", json=branch_data)
        assert response.status_code == 200
        data = response.json()
        assert "branch_id" in data

    def test_list_branches(self, client, test_workflow):
        """Test listing workflow branches."""
        response = client.get(f"/branches/list/{test_workflow}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.integration
    def test_branch_operations(self, client, test_workflow):
        """Test branch operations."""
        # Create branch
        branch_data = {
            "base_id": test_workflow,
            "prompt": "Test branch",
            "config": {}
        }
        response = client.post("/branches/create", json=branch_data)
        branch_id = response.json()["branch_id"]
        
        # Get diff
        response = client.get(
            f"/branches/diff/{branch_id}",
            params={"base_id": test_workflow}
        )
        assert response.status_code == 200
        
        # Delete branch
        response = client.delete(f"/branches/{branch_id}")
        assert response.status_code == 200

class TestAIConfigController:
    """Tests for the AI configuration controller."""

    def test_config_management(self, client):
        """Test AI configuration CRUD operations."""
        config = test_data["ai_configs"]["openai_gpt4"]
        
        # Create
        response = client.post("/ai/configs", json=config)
        assert response.status_code == 200
        
        # Get
        response = client.get(f"/ai/configs/{config['name']}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == config["name"]
        
        # Delete
        response = client.delete(f"/ai/configs/{config['name']}")
        assert response.status_code == 200

    def test_config_validation(self, client):
        """Test AI configuration validation."""
        invalid_config = {
            "provider": "invalid",
            "name": "test",
            "credentials": {}
        }
        response = client.post("/ai/configs", json=invalid_config)
        assert response.status_code == 400

    @pytest.mark.integration
    def test_config_testing(self, client):
        """Test AI configuration testing."""
        config = test_data["ai_configs"]["openai_gpt4"]
        response = client.post("/ai/configs/test", json=config)
        assert response.status_code == 200
        data = response.json()
        assert "success" in data

@pytest.mark.websocket
class TestWebSocketController:
    """Tests for the WebSocket controller."""

    async def test_websocket_connection(self, client, test_workflow):
        """Test WebSocket connection and messaging."""
        async with AsyncTestContext():
            with client.websocket_connect(f"/ws/{test_workflow}") as websocket:
                # Test history request
                message = test_data["websocket_messages"]["history_request"]
                await websocket.send_json(message)
                response = await websocket.receive_json()
                assert response["type"] == "history_update"
                
                # Test ping
                message = test_data["websocket_messages"]["ping"]
                await websocket.send_json(message)
                response = await websocket.receive_json()
                assert response["type"] == "pong"

    @pytest.mark.integration
    async def test_websocket_workflow_updates(self, client, test_workflow):
        """Test WebSocket workflow updates."""
        async with AsyncTestContext():
            with client.websocket_connect(f"/ws/{test_workflow}") as websocket:
                # Execute workflow step
                response = await client.post(f"/workflows/{test_workflow}/step")
                assert response.status_code == 200
                
                # Check for update message
                response = await websocket.receive_json()
                assert response["type"] == "step_complete"
