from pydantic import BaseModel
from typing import Dict, Any

class GenerationRequest(BaseModel):
    prompt: str
    model: str = "llama2"
    options: Dict[str, Any] = {}
    context_id: str = None

class WorkflowNode(BaseModel):
    node_type: str
    config: Dict[str, Any]
    position: tuple[int, int]
    connections: list[str] = []