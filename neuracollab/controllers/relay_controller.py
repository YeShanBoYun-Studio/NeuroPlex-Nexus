from uuid import UUID, uuid4
from typing import List, Dict
from ..models import CacheEntry
from ..cache_pool import NeuralCachePool
from ..dispatcher import LLMDispatcher

class RelayController:
    def __init__(self, cache_pool: NeuralCachePool, dispatcher: LLMDispatcher):
        self.cache = cache_pool
        self.dispatcher = dispatcher

    async def create_workflow(self, initial_prompt: str, config: Dict) -> UUID:
        initial_entry = CacheEntry(
            content=initial_prompt,
            prompt=config["initial_prompt_template"],
            author="System:Init"
        )
        return await self.cache.add_entry(initial_entry)

    async def execute_step(self, workflow_id: UUID, step_config: Dict) -> CacheEntry:
        context = self.cache.get_context(workflow_id)
        prompt = self._build_prompt(context, step_config)
        
        content = await self.dispatcher.dispatch(
            prompt=prompt,
            model_name=step_config["model"]
        )
        
        new_entry = CacheEntry(
            parent_id=workflow_id,
            content=content,
            prompt=prompt,
            author=f"AI:{step_config['model']}",
            metadata={
                "step_config": step_config,
                "compression_ratio": 1.0
            }
        )
        
        return await self.cache.add_entry(new_entry)

    def _build_prompt(self, context: str, config: Dict) -> str:
        return f"""根据以下上下文继续创作：
{context}

{config['instructions']}
"""
