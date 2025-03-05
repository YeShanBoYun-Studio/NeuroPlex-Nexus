"""
Controller for WebSocket connections and real-time updates.
"""
import logging
from typing import Dict, Any
from uuid import UUID
from fastapi import APIRouter, WebSocket
from starlette.websockets import WebSocketDisconnect

from .cache_pool import NeuralCachePool
from .engine import CollaborationEngine

logger = logging.getLogger(__name__)
router = APIRouter()

class WebSocketManager:
    def __init__(self, cache_pool: NeuralCachePool, engine: CollaborationEngine):
        self.active_connections: Dict[UUID, WebSocket] = {}
        self.cache_pool = cache_pool
        self.engine = engine

    async def connect(self, websocket: WebSocket, workflow_id: UUID):
        """Connect a new WebSocket client."""
        await websocket.accept()
        self.active_connections[workflow_id] = websocket
        logger.info(f"WebSocket connected for workflow {workflow_id}")

    def disconnect(self, workflow_id: UUID):
        """Disconnect a WebSocket client."""
        if workflow_id in self.active_connections:
            del self.active_connections[workflow_id]
            logger.info(f"WebSocket disconnected for workflow {workflow_id}")

    async def broadcast(self, workflow_id: UUID, message: Dict[str, Any]):
        """Broadcast a message to a specific workflow's WebSocket."""
        if websocket := self.active_connections.get(workflow_id):
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Failed to broadcast message: {e}")
                await self.handle_disconnect(workflow_id)

    async def broadcast_many(self, workflow_ids: list[UUID], message: Dict[str, Any]):
        """Broadcast a message to multiple workflows."""
        for workflow_id in workflow_ids:
            await self.broadcast(workflow_id, message)

    async def handle_disconnect(self, workflow_id: UUID):
        """Handle client disconnection."""
        self.disconnect(workflow_id)
        # Additional cleanup if needed
        await self.engine.handle_client_disconnect(workflow_id)

def get_websocket_router(ws_manager: WebSocketManager):
    """Create a router with WebSocket endpoints."""

    @router.websocket("/ws/{workflow_id}")
    async def websocket_endpoint(websocket: WebSocket, workflow_id: UUID):
        """WebSocket endpoint for real-time workflow updates."""
        try:
            await ws_manager.connect(websocket, workflow_id)

            try:
                while True:
                    data = await websocket.receive_json()
                    
                    # Handle different message types
                    if data.get("type") == "request_history":
                        history = await ws_manager.cache_pool.get_history(workflow_id)
                        await ws_manager.broadcast(workflow_id, {
                            "type": "history_update",
                            "data": history
                        })
                    
                    elif data.get("type") == "step_status":
                        status = await ws_manager.engine.get_workflow_status(workflow_id)
                        await ws_manager.broadcast(workflow_id, {
                            "type": "status_update",
                            "data": status
                        })
                    
                    elif data.get("type") == "ping":
                        await ws_manager.broadcast(workflow_id, {
                            "type": "pong",
                            "timestamp": data.get("timestamp")
                        })

            except WebSocketDisconnect:
                await ws_manager.handle_disconnect(workflow_id)
                
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await ws_manager.broadcast(workflow_id, {
                    "type": "error",
                    "message": str(e)
                })
                
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            # Ensure connection is closed
            if workflow_id in ws_manager.active_connections:
                await ws_manager.handle_disconnect(workflow_id)

    return router

def create_websocket_manager(cache_pool: NeuralCachePool, engine: CollaborationEngine) -> WebSocketManager:
    """Create and configure a WebSocket manager."""
    return WebSocketManager(cache_pool, engine)
