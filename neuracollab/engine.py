"""
Engine - Core collaboration engine implementation.
"""
from typing import Dict, Optional, Any
from uuid import UUID
from .models import CacheEntry, WorkflowConfig
from .dispatcher import LLMDispatcher

class CollaborationEngine:
    """
    Core engine for managing the collaboration workflow.
    """
    def __init__(self, cache_pool: Any):  # Using Any to avoid circular import
        self.cache = cache_pool
        self.dispatcher = LLMDispatcher()
        self._active_workflows: Dict[UUID, WorkflowConfig] = {}

    async def start_workflow(self, config: WorkflowConfig, initial_content: str) -> UUID:
        """Initialize a new collaboration workflow."""
        initial_entry = CacheEntry(
            content=initial_content,
            prompt=config.prompt_template,
            author="User:Initiator",
            metadata={"workflow_mode": config.mode}
        )
        entry_id = await self.cache.add_entry(initial_entry)
        self._active_workflows[entry_id] = config
        return entry_id

    async def execute_step(self, current_id: UUID, model_name: Optional[str] = None) -> CacheEntry:
        """Execute the next collaboration step."""
        if current_id not in self._active_workflows:
            raise ValueError(f"No active workflow found for {current_id}")

        config = self._active_workflows[current_id]
        context = self.cache.get_context(current_id, config)
        
        # Generate response
        prompt = self._build_step_prompt(context, config)
        response = await self.dispatcher.dispatch(prompt, model_name or "gpt-4")
        
        if not response:
            raise RuntimeError("Failed to generate response")
        
        # Create new cache entry
        new_entry = CacheEntry(
            parent_id=current_id,
            content=response,
            prompt=prompt,
            author=f"AI:{model_name or 'default'}",
            metadata={
                "workflow_mode": config.mode,
                "model": model_name
            }
        )
        
        await self.cache.add_entry(new_entry)
        return new_entry

    def _build_step_prompt(self, context: str, config: WorkflowConfig) -> str:
        """Build the prompt for the current step."""
        if config.mode == "relay":
            return (
                "You are continuing a collaborative writing process.\n\n"
                f"Previous content:\n{context}\n\n"
                "Continue in the same style and tone, adding meaningful progress "
                "while maintaining consistency with the established narrative."
            )
        elif config.mode == "debate":
            return (
                "You are participating in a structured debate.\n\n"
                f"Previous arguments:\n{context}\n\n"
                "Analyze the arguments presented and provide a well-reasoned "
                "response that either supports or challenges the previous points."
            )
        else:
            return config.prompt_template.format(context=context)
