"""
Controller for managing workflows and their operations.
"""
import logging
from typing import Dict, Any, List
from uuid import UUID
from fastapi import APIRouter, HTTPException, WebSocket, Query, BackgroundTasks

from .models import (
    WorkflowConfig,
    CacheEntry,
    WorkflowCreate,
    WorkflowControl
)
from .engine import CollaborationEngine
from .dispatcher import LLMDispatcher
from .cache_pool import NeuralCachePool

logger = logging.getLogger(__name__)
router = APIRouter()

def get_workflow_controller(
    engine: CollaborationEngine,
    dispatcher: LLMDispatcher,
    cache_pool: NeuralCachePool,
    active_websockets: Dict[UUID, WebSocket]
):
    """Create a router with workflow management endpoints."""

    @router.post("/create", response_model=Dict[str, UUID])
    async def create_workflow(workflow: WorkflowCreate):
        """Create a new workflow."""
        try:
            workflow_id = await engine.create_workflow(
                name=workflow.name,
                mode=workflow.mode,
                config=workflow.config
            )

            # Add initial content if provided
            if workflow.initial_content:
                await engine.add_entry(
                    workflow_id=workflow_id,
                    content=workflow.initial_content,
                    author="system",
                    metadata={
                        "type": "initialization",
                        "mode": workflow.mode
                    }
                )

            return {"workflow_id": workflow_id}
        except Exception as e:
            logger.error(f"Failed to create workflow: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/{workflow_id}")
    async def get_workflow(workflow_id: UUID):
        """Get workflow details."""
        try:
            workflow = await engine.get_workflow(workflow_id)
            if not workflow:
                raise HTTPException(status_code=404, detail="Workflow not found")
            return workflow
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to get workflow: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.patch("/{workflow_id}/control")
    async def control_workflow(workflow_id: UUID, control: WorkflowControl):
        """Control workflow execution."""
        try:
            result = await engine.control_workflow(workflow_id, control.action)
            return {"status": "success", "action": control.action, "result": result}
        except Exception as e:
            logger.error(f"Failed to control workflow: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/{workflow_id}/history")
    async def get_workflow_history(
        workflow_id: UUID,
        limit: int = Query(50, ge=1, le=1000),
        offset: int = Query(0, ge=0)
    ) -> List[CacheEntry]:
        """Get workflow history."""
        try:
            return await cache_pool.get_history(workflow_id, limit, offset)
        except Exception as e:
            logger.error(f"Failed to get workflow history: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/{workflow_id}/step")
    async def execute_step(
        workflow_id: UUID,
        model_name: str = Query(None),
        background_tasks: BackgroundTasks = None
    ):
        """Execute next workflow step."""
        try:
            step_result = await engine.execute_step(
                workflow_id=workflow_id,
                model_name=model_name
            )

            # Broadcast update to connected clients
            if websocket := active_websockets.get(workflow_id):
                background_tasks.add_task(
                    websocket.send_json,
                    {
                        "type": "step_complete",
                        "data": step_result
                    }
                )

            return step_result
        except Exception as e:
            logger.error(f"Failed to execute workflow step: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/{workflow_id}/input")
    async def add_user_input(
        workflow_id: UUID,
        content: str = Query(..., min_length=1),
        metadata: Dict[str, Any] = None
    ):
        """Add user input to workflow."""
        try:
            entry = await engine.add_entry(
                workflow_id=workflow_id,
                content=content,
                author="user",
                metadata=metadata or {}
            )
            return entry
        except Exception as e:
            logger.error(f"Failed to add user input: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/{workflow_id}/status")
    async def get_workflow_status(workflow_id: UUID):
        """Get current workflow status."""
        try:
            status = await engine.get_workflow_status(workflow_id)
            return status
        except Exception as e:
            logger.error(f"Failed to get workflow status: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/{workflow_id}/reset")
    async def reset_workflow(workflow_id: UUID):
        """Reset workflow to initial state."""
        try:
            await engine.reset_workflow(workflow_id)
            return {"status": "success"}
        except Exception as e:
            logger.error(f"Failed to reset workflow: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.delete("/{workflow_id}")
    async def delete_workflow(workflow_id: UUID):
        """Delete a workflow."""
        try:
            await engine.delete_workflow(workflow_id)
            # Clean up any websocket connections
            if workflow_id in active_websockets:
                await active_websockets[workflow_id].close()
                del active_websockets[workflow_id]
            return {"status": "success"}
        except Exception as e:
            logger.error(f"Failed to delete workflow: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/")
    async def list_workflows(
        limit: int = Query(20, ge=1, le=100),
        offset: int = Query(0, ge=0),
        mode: str = None
    ):
        """List workflows with pagination."""
        try:
            workflows = await engine.list_workflows(limit, offset, mode)
            return workflows
        except Exception as e:
            logger.error(f"Failed to list workflows: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router
