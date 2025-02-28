"""
Public API for the NeuraCollab system.
"""

from typing import Optional, Dict, Any, List
from uuid import UUID
from fastapi import HTTPException
from .models import WorkflowConfig, CacheEntry
from .cache_pool import NeuralCachePool
from .engine import CollaborationEngine, LLMInterface, LLMRegistry

class NeuraCollab:
    """
    Main API interface for the NeuraCollab system.
    """
    def __init__(self):
        self.cache_pool = NeuralCachePool()
        self.engine = CollaborationEngine(self.cache_pool)

    def register_llm(self, name: str, llm: LLMInterface, set_default: bool = False):
        """Register a language model implementation."""
        self.engine.llm_registry.register_model(name, llm, set_default)

    async def start_relay_workflow(
        self,
        initial_content: str,
        roles: list[str],
        max_steps: int = 10
    ) -> UUID:
        """
        Start a relay-style collaboration workflow where each AI takes turns
        continuing the content based on different roles.
        """
        config = WorkflowConfig(
            mode="relay",
            prompt_template=(
                "You are a {role}. Review the previous content and continue "
                "the work while maintaining consistency with the established "
                "style and direction:\n\n{context}"
            ),
            inheritance_rules={
                "full_history": False,
                "last_3_steps": True,
                "prompt_chain": True
            },
            termination_conditions={
                "max_steps": max_steps,
                "inactivity_timeout": 300
            }
        )
        
        return await self.engine.start_workflow(config, initial_content)

    async def start_debate_workflow(
        self,
        topic: str,
        initial_argument: str,
        max_rounds: int = 5
    ) -> UUID:
        """
        Start a structured debate workflow where AIs argue different positions.
        """
        config = WorkflowConfig(
            mode="debate",
            prompt_template=(
                f"Topic: {topic}\\n\\n"
                "Previous arguments:\\n{{context}}\\n\\n"
                "Provide a well-reasoned response that either supports or "
                "challenges the previous points. Use evidence and logic to "
                "strengthen your position."
            ),
            inheritance_rules={
                "full_history": True,
                "last_3_steps": False,
                "prompt_chain": True
            },
            termination_conditions={
                "max_steps": max_rounds * 2,  # Both sides per round
                "inactivity_timeout": 600
            }
        )
        
        return await self.engine.start_workflow(config, initial_argument)

    async def start_custom_workflow(
        self,
        config: WorkflowConfig,
        initial_content: str
    ) -> UUID:
        """
        Start a custom collaboration workflow with specific configuration.
        """
        return await self.engine.start_workflow(config, initial_content)

    async def execute_next_step(
        self,
        workflow_id: UUID,
        model_name: Optional[str] = None
    ) -> CacheEntry:
        """
        Execute the next step in a collaboration workflow.
        """
        return await self.engine.execute_step(workflow_id, model_name)

    async def add_user_input(
        self,
        workflow_id: UUID,
        content: str,
        prompt: Optional[str] = None
    ) -> CacheEntry:
        """
        Add user input to an ongoing workflow.
        """
        return await self.engine.handle_user_input(workflow_id, content, prompt)

    def get_workflow_history(self, workflow_id: UUID) -> List[CacheEntry]:
        """
        Retrieve the complete history of a workflow.
        """
        return self.cache_pool.storage.get_branch(workflow_id)

    def create_branch(
        self,
        base_id: UUID,
        new_prompt: str
    ) -> UUID:
        """
        Create a new branch from an existing entry for parallel exploration.
        """
        return self.cache_pool.create_branch(base_id, new_prompt)

    async def role_step(
        self,
        workflow_id: UUID,
        role: str,
        context: str,
        model_name: Optional[str] = None,
        extra: Optional[Dict[str, Any]] = None
    ) -> CacheEntry:
        """
        Invoke a specific role in the collaboration engine (e.g., worldbuilder, editor).
        This calls the corresponding handler for the current workflow's mode.

        :param workflow_id: UUID of the active workflow
        :param role: The role to invoke (e.g., worldbuilder, editor)
        :param context: The current step context or conversation so far
        :param model_name: (Optional) a specific LLM to use
        :param extra: (Optional) additional parameters for the LLM call
        :return: A CacheEntry containing the AI-generated text
        """
        try:
            if workflow_id not in self.engine._active_workflows:
                raise HTTPException(status_code=404, detail="No active workflow found with that ID.")
            
            config = self.engine._active_workflows[workflow_id]
            mode = config.mode

            # Check if the mode (relay, debate, etc.) has this role
            if (mode not in self.engine._role_handlers) or (role not in self.engine._role_handlers[mode]):
                raise HTTPException(
                    status_code=400,
                    detail=f"Role '{role}' is not valid for mode '{mode}'."
                )
            
            handler = self.engine._role_handlers[mode][role]
            extra_args = extra or {}

            # Invoke the appropriate role handler
            result_text = await handler(context, model_name=model_name, **extra_args)

            # Create a new CacheEntry with the result
            new_entry = CacheEntry(
                parent_id=workflow_id,
                content=result_text,
                prompt=f"Invoked role: {role}",
                author=f"AI:{model_name or 'default'}",
                metadata={
                    "workflow_mode": mode,
                    "role_invoked": role
                }
            )
            self.cache_pool.add_entry(new_entry)
            return new_entry

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
