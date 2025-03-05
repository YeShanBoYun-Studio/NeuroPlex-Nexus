"""
Data models for the NeuraCollab system.
"""
from typing import Dict, Optional, Any
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class CacheEntry(BaseModel):
    """Text cache pool base unit representing a single collaboration step."""
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    entry_id: UUID = Field(default_factory=uuid4)
    parent_id: Optional[UUID] = None
    content: str
    prompt: str
    author: str  # Format: "AI:model_name" or "User:username"
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class WorkflowConfig(BaseModel):
    """Configuration for a collaboration workflow."""
    mode: str  # "relay", "debate", or "custom"
    prompt_template: str
    inheritance_rules: Dict[str, bool] = {
        "full_history": False,
        "last_3_steps": True,
        "prompt_chain": True
    }
    termination_conditions: Dict[str, int] = {
        "max_steps": 10,
        "inactivity_timeout": 300  # seconds
    }
    roles: Optional[Dict[str, Dict[str, Any]]] = None
    model_settings: Optional[Dict[str, Dict[str, Any]]] = None

class WorkflowStep(BaseModel):
    """Configuration for a single step in the workflow."""
    role: str
    model: str
    prompt_template: str
    parameters: Dict[str, Any] = Field(default_factory=dict)

class BranchInfo(BaseModel):
    """Information about a workflow branch."""
    branch_id: UUID
    base_id: UUID
    prompt: str
    created_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ModelConfig(BaseModel):
    """Configuration for an AI model."""
    name: str
    provider: str  # e.g., "openai", "anthropic", "ollama"
    api_key: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    fallback_models: list[str] = Field(default_factory=list)
