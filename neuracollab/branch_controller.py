"""
Controller for managing workflow branches and merging operations.
"""
import logging
from typing import Dict, Any, List
from uuid import UUID
from fastapi import APIRouter, HTTPException, Query

from .models import BranchCreate, BranchInfo
from .engine import CollaborationEngine
from .cache_pool import NeuralCachePool

logger = logging.getLogger(__name__)
router = APIRouter()

def get_branch_controller(engine: CollaborationEngine, cache_pool: NeuralCachePool):
    """Create a router with branch management endpoints."""

    @router.post("/create")
    async def create_branch(branch: BranchCreate) -> BranchInfo:
        """Create a new branch from an existing entry."""
        try:
            # Verify base entry exists
            if not await cache_pool.get_entry(branch.base_id):
                raise HTTPException(status_code=404, detail="Base entry not found")

            # Create branch
            branch_info = await engine.create_branch(
                base_id=branch.base_id,
                prompt=branch.prompt,
                config=branch.config
            )
            return branch_info
        except Exception as e:
            logger.error(f"Failed to create branch: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/list/{workflow_id}")
    async def list_branches(workflow_id: UUID) -> List[BranchInfo]:
        """List all branches for a workflow."""
        try:
            branches = await engine.get_workflow_branches(workflow_id)
            return branches
        except Exception as e:
            logger.error(f"Failed to list branches: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/merge/{branch_id}")
    async def merge_branch(
        branch_id: UUID,
        target_id: UUID = Query(..., description="Target branch/main ID to merge into"),
        strategy: str = Query("auto", description="Merge strategy: auto, manual, or rebase")
    ) -> Dict[str, Any]:
        """Merge a branch into another branch or main workflow."""
        try:
            merge_result = await engine.merge_branches(
                source_id=branch_id,
                target_id=target_id,
                strategy=strategy
            )
            return {
                "status": "success",
                "message": f"Branch {branch_id} merged successfully",
                "result": merge_result
            }
        except Exception as e:
            logger.error(f"Failed to merge branch: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/resolve/{branch_id}")
    async def resolve_conflict(
        branch_id: UUID,
        resolution: Dict[str, Any]
    ) -> Dict[str, str]:
        """Resolve a merge conflict."""
        try:
            await engine.resolve_merge_conflict(branch_id, resolution)
            return {
                "status": "success",
                "message": "Conflict resolved successfully"
            }
        except Exception as e:
            logger.error(f"Failed to resolve conflict: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/diff/{branch_id}")
    async def get_branch_diff(
        branch_id: UUID,
        base_id: UUID = Query(..., description="Base branch/main ID to compare against")
    ) -> Dict[str, Any]:
        """Get differences between branches."""
        try:
            diff = await engine.get_branch_diff(branch_id, base_id)
            return {
                "base_id": base_id,
                "branch_id": branch_id,
                "differences": diff
            }
        except Exception as e:
            logger.error(f"Failed to get branch diff: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.delete("/{branch_id}")
    async def delete_branch(branch_id: UUID) -> Dict[str, str]:
        """Delete a branch."""
        try:
            await engine.delete_branch(branch_id)
            return {
                "status": "success",
                "message": f"Branch {branch_id} deleted successfully"
            }
        except Exception as e:
            logger.error(f"Failed to delete branch: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/{branch_id}/sync")
    async def sync_branch(
        branch_id: UUID,
        target_id: UUID = Query(..., description="Target to sync with")
    ) -> Dict[str, Any]:
        """Synchronize a branch with its target."""
        try:
            sync_result = await engine.sync_branch(branch_id, target_id)
            return {
                "status": "success",
                "changes": sync_result["changes"],
                "conflicts": sync_result["conflicts"]
            }
        except Exception as e:
            logger.error(f"Failed to sync branch: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/{branch_id}/history")
    async def get_branch_history(branch_id: UUID) -> List[Dict[str, Any]]:
        """Get the history of changes in a branch."""
        try:
            history = await engine.get_branch_history(branch_id)
            return history
        except Exception as e:
            logger.error(f"Failed to get branch history: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router
