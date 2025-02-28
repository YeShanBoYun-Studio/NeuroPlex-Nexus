"""
Core data models for the NeuraCollab system.
"""

from typing import Dict, List, Optional
from datetime import datetime
from uuid import UUID, uuid4
from pydantic import BaseModel, Field

class CacheEntry(BaseModel):
    """
    Text cache pool base unit representing a single collaboration step.
    """
    entry_id: UUID = Field(default_factory=uuid4)
    parent_id: Optional[UUID] = None
    content: str
    prompt: str
    author: str  # Format: "AI:model_name" or "User:username"
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, str] = Field(default_factory=dict)

    class Config:
        json_schema_extra = {
            "example": {
                "entry_id": "123e4567-e89b-12d3-a456-426614174000",
                "parent_id": None,
                "content": "Initial draft of the document",
                "prompt": "Create an introduction for a technical paper",
                "author": "AI:gpt-4",
                "metadata": {"temperature": "0.7", "max_tokens": "2000"}
            }
        }

class WorkflowConfig(BaseModel):
    """
    Configuration for defining collaboration flow behavior.
    """
    mode: str = Field(
        ...,  # Required field
        description="Collaboration mode (relay/debate/custom)",
        pattern="^(relay|debate|custom)$"
    )
    prompt_template: str
    inheritance_rules: Dict[str, bool] = Field(
        default_factory=lambda: {
            "full_history": False,
            "last_3_steps": True,
            "prompt_chain": True
        }
    )
    termination_conditions: Dict[str, int] = Field(
        default_factory=lambda: {
            "max_steps": 10,
            "inactivity_timeout": 300  # seconds
        }
    )

    class Config:
        json_schema_extra = {
            "example": {
                "mode": "relay",
                "prompt_template": "You are a {role}. Continue the story...",
                "inheritance_rules": {
                    "full_history": False,
                    "last_3_steps": True,
                    "prompt_chain": True
                },
                "termination_conditions": {
                    "max_steps": 10,
                    "inactivity_timeout": 300
                }
            }
        }
