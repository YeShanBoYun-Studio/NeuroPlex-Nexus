"""
FastAPI server implementation for NeuraCollab.
"""

from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from uuid import UUID
import json
import asyncio

from .api import NeuraCollab
from .models import WorkflowConfig, CacheEntry
from .examples import OpenAILLM  # For demo purposes

# API Models
class WorkflowStart(BaseModel):
    mode: str
    initial_content: str
    config: Optional[Dict] = None
    roles: Optional[List[str]] = None
    max_steps: Optional[int] = None

class UserInput(BaseModel):
    content: str
    prompt: Optional[str] = None

class BranchCreate(BaseModel):
    base_id: UUID
    new_prompt: str

# Initialize FastAPI
app = FastAPI(title="NeuraCollab API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize NeuraCollab
collab = NeuraCollab()
# Register a demo LLM (replace with real implementation)
collab.register_llm("gpt4", OpenAILLM(), set_default=True)

@app.post("/workflows/relay")
async def start_relay_workflow(data: WorkflowStart) -> Dict:
    """Start a relay-style collaboration workflow."""
    try:
        workflow_id = await collab.start_relay_workflow(
            initial_content=data.initial_content,
            roles=data.roles or ["writer", "editor", "reviewer"],
            max_steps=data.max_steps or 10
        )
        return {"workflow_id": str(workflow_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/workflows/debate")
async def start_debate_workflow(data: WorkflowStart) -> Dict:
    """Start a debate workflow."""
    try:
        workflow_id = await collab.start_debate_workflow(
            topic=data.initial_content,
            initial_argument="Initial position on: " + data.initial_content,
            max_rounds=data.max_steps or 3
        )
        return {"workflow_id": str(workflow_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/workflows/custom")
async def start_custom_workflow(data: WorkflowStart) -> Dict:
    """Start a custom workflow."""
    try:
        config = WorkflowConfig(**data.config) if data.config else WorkflowConfig(
            mode="custom",
            prompt_template="Continue the work:\n\n{context}"
        )
        workflow_id = await collab.start_custom_workflow(
            config=config,
            initial_content=data.initial_content
        )
        return {"workflow_id": str(workflow_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/workflows/{workflow_id}/step")
async def execute_step(workflow_id: UUID, model_name: Optional[str] = None) -> Dict:
    """Execute next step in workflow."""
    try:
        entry = await collab.execute_next_step(workflow_id, model_name)
        return {
            "entry_id": str(entry.entry_id),
            "content": entry.content,
            "author": entry.author,
            "timestamp": entry.timestamp.isoformat(),
            "metadata": entry.metadata
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/workflows/{workflow_id}/input")
async def add_user_input(workflow_id: UUID, data: UserInput) -> Dict:
    """Add user input to workflow."""
    try:
        entry = await collab.add_user_input(
            workflow_id=workflow_id,
            content=data.content,
            prompt=data.prompt
        )
        return {
            "entry_id": str(entry.entry_id),
            "content": entry.content,
            "author": entry.author,
            "timestamp": entry.timestamp.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/workflows/{workflow_id}/history")
async def get_history(workflow_id: UUID) -> List[Dict]:
    """Get workflow history."""
    try:
        history = collab.get_workflow_history(workflow_id)
        return [
            {
                "entry_id": str(entry.entry_id),
                "parent_id": str(entry.parent_id) if entry.parent_id else None,
                "content": entry.content,
                "author": entry.author,
                "prompt": entry.prompt,
                "timestamp": entry.timestamp.isoformat(),
                "metadata": entry.metadata
            }
            for entry in history
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/workflows/branch")
async def create_branch(data: BranchCreate) -> Dict:
    """Create a new branch from existing entry."""
    try:
        branch_id = collab.create_branch(
            base_id=data.base_id,
            new_prompt=data.new_prompt
        )
        return {"branch_id": str(branch_id)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# WebSocket for real-time updates
@app.websocket("/ws/{workflow_id}")
async def websocket_endpoint(websocket: WebSocket, workflow_id: UUID):
    await websocket.accept()
    try:
        while True:
            # Send updates about workflow progress
            history = collab.get_workflow_history(workflow_id)
            await websocket.send_json({
                "type": "history_update",
                "data": [
                    {
                        "entry_id": str(entry.entry_id),
                        "content": entry.content,
                        "author": entry.author,
                        "timestamp": entry.timestamp.isoformat()
                    }
                    for entry in history
                ]
            })
            await asyncio.sleep(1)  # Poll every second
    except Exception:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
