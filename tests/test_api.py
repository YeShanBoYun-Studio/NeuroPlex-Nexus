"""
Integration tests for the NeuraCollab API.
"""
import os
import pytest
from fastapi.testclient import TestClient
from uuid import UUID
import json

from neuracollab.server import app

# Initialize test client
client = TestClient(app)

@pytest.fixture
def test_workflow_id():
    """Create a test workflow and return its ID."""
    response = client.post(
        "/workflows/create",
        json={
            "name": "test_workflow",
            "mode": "relay",
            "initial_content": "Test content",
            "config": {
                "prompt_template": "Continue the story",
                "inheritance_rules": {
                    "full_history": False,
                    "last_3_steps": True,
                    "prompt_chain": True
                }
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    return str(data["workflow_id"])

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "cache_stats" in data

def test_ai_config_operations():
    """Test AI configuration CRUD operations."""
    # Create config
    config = {
        "provider": "openai",
        "name": "test_config",
        "credentials": {
            "api_key": "test_key",
            "model_name": "gpt-4"
        },
        "is_active": True,
        "priority": 1
    }
    
    response = client.post("/ai/configs", json=config)
    assert response.status_code == 200
    
    # Get config
    response = client.get("/ai/configs/test_config")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test_config"
    
    # Update config
    config["priority"] = 2
    response = client.post("/ai/configs", json=config)
    assert response.status_code == 200
    
    # Delete config
    response = client.delete("/ai/configs/test_config")
    assert response.status_code == 200

def test_workflow_operations(test_workflow_id):
    """Test workflow operations."""
    # Get workflow
    response = client.get(f"/workflows/{test_workflow_id}")
    assert response.status_code == 200
    
    # Add input
    response = client.post(
        f"/workflows/{test_workflow_id}/input",
        params={"content": "User input"}
    )
    assert response.status_code == 200
    
    # Execute step
    response = client.post(f"/workflows/{test_workflow_id}/step")
    assert response.status_code == 200
    
    # Get history
    response = client.get(f"/workflows/{test_workflow_id}/history")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

def test_cache_operations():
    """Test cache operations."""
    # Get cache settings
    response = client.get("/cache/settings")
    assert response.status_code == 200
    
    # Update settings
    settings = {
        "max_size_mb": 100,
        "compression_enabled": True,
        "compression_threshold": 0.7
    }
    response = client.post("/cache/settings", json=settings)
    assert response.status_code == 200
    
    # Get stats
    response = client.get("/cache/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_entries" in data
    assert "size_mb" in data

def test_branch_operations(test_workflow_id):
    """Test branch operations."""
    # Create branch
    response = client.post("/branches/create", json={
        "base_id": test_workflow_id,
        "prompt": "Test branch",
        "config": {}
    })
    assert response.status_code == 200
    branch_data = response.json()
    branch_id = branch_data["branch_id"]
    
    # List branches
    response = client.get(f"/branches/list/{test_workflow_id}")
    assert response.status_code == 200
    branches = response.json()
    assert len(branches) > 0
    
    # Get branch diff
    response = client.get(
        f"/branches/diff/{branch_id}",
        params={"base_id": test_workflow_id}
    )
    assert response.status_code == 200
    
    # Delete branch
    response = client.delete(f"/branches/{branch_id}")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_websocket():
    """Test WebSocket connection and messages."""
    with client.websocket_connect(f"/ws/{test_workflow_id}") as websocket:
        # Request history
        websocket.send_json({
            "type": "request_history"
        })
        response = websocket.receive_json()
        assert response["type"] == "history_update"
        assert "data" in response
        
        # Test ping
        websocket.send_json({
            "type": "ping",
            "timestamp": 123456789
        })
        response = websocket.receive_json()
        assert response["type"] == "pong"
        assert response["timestamp"] == 123456789

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
