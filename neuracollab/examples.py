"""
Example usage of the NeuraCollab system.
"""

import asyncio
from typing import Optional
import os

from .api import NeuraCollab
from .engine import LLMInterface
from .models import WorkflowConfig

# Example LLM Implementation
class OpenAILLM(LLMInterface):
    """
    Example OpenAI GPT implementation.
    Note: In practice, you would use the official OpenAI API.
    """
    def __init__(self, model_name: str = "gpt-4"):
        self.model_name = model_name
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")

    async def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate content using OpenAI's API.
        This is a simplified example - real implementation would use openai package.
        """
        # Simulate API call
        await asyncio.sleep(1)
        return f"Generated response for prompt: {prompt[:50]}..."

    def get_model_name(self) -> str:
        return self.model_name

class AnthropicLLM(LLMInterface):
    """
    Example Anthropic Claude implementation.
    Note: In practice, you would use the official Anthropic API.
    """
    def __init__(self, model_name: str = "claude-2"):
        self.model_name = model_name
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")

    async def generate(self, prompt: str, **kwargs) -> str:
        await asyncio.sleep(1)
        return f"Claude's response to: {prompt[:50]}..."

    def get_model_name(self) -> str:
        return self.model_name

# Example Workflow Patterns
async def story_collaboration_example():
    """
    Example of a relay-style story writing collaboration.
    """
    # Initialize NeuraCollab
    collab = NeuraCollab()
    
    # Register LLMs
    collab.register_llm("gpt4", OpenAILLM("gpt-4"), set_default=True)
    collab.register_llm("claude", AnthropicLLM())
    
    # Start a relay workflow
    workflow_id = await collab.start_relay_workflow(
        initial_content="Once upon a time in a cyberpunk metropolis...",
        roles=["worldbuilder", "character_designer", "plot_developer"],
        max_steps=6
    )
    
    # Execute multiple steps
    for _ in range(3):
        entry = await collab.execute_next_step(workflow_id)
        print(f"\nStep by {entry.author}:\n{entry.content[:200]}...")
        
        # Simulate user intervention after each step
        await collab.add_user_input(
            workflow_id,
            "User's editorial suggestions and modifications...",
            "Refine character motivations"
        )

async def debate_example():
    """
    Example of a structured debate workflow.
    """
    collab = NeuraCollab()
    collab.register_llm("gpt4", OpenAILLM(), set_default=True)
    
    # Start a debate
    workflow_id = await collab.start_debate_workflow(
        topic="Should AI systems have access to real-time internet data?",
        initial_argument="AI systems with real-time internet access could...",
        max_rounds=3
    )
    
    # Run debate rounds
    for round in range(3):
        print(f"\nRound {round + 1}")
        
        # Pro argument
        pro = await collab.execute_next_step(workflow_id)
        print(f"Pro: {pro.content[:200]}...")
        
        # Con argument
        con = await collab.execute_next_step(workflow_id)
        print(f"Con: {con.content[:200]}...")
        
        # Optional: Create branch for alternative argument
        if round == 1:
            branch_id = collab.create_branch(
                pro.entry_id,
                "Explore alternative perspective on privacy implications"
            )
            alt = await collab.execute_next_step(branch_id)
            print(f"\nAlternative branch: {alt.content[:200]}...")

async def custom_workflow_example():
    """
    Example of a custom workflow for iterative document improvement.
    """
    collab = NeuraCollab()
    collab.register_llm("gpt4", OpenAILLM(), set_default=True)
    
    # Configure custom workflow
    config = WorkflowConfig(
        mode="custom",
        prompt_template=(
            "You are an expert editor. Review and improve the following text "
            "focusing on {focus_area}:\n\n{context}\n\nProvide improved version "
            "with clear explanations of your changes."
        ),
        inheritance_rules={
            "full_history": True,
            "last_3_steps": False,
            "prompt_chain": True
        },
        termination_conditions={
            "max_steps": 5,
            "inactivity_timeout": 300
        }
    )
    
    # Start workflow
    workflow_id = await collab.start_custom_workflow(
        config,
        initial_content="Draft technical documentation..."
    )
    
    # Improvement rounds with different focus areas
    focus_areas = ["clarity", "technical accuracy", "conciseness"]
    
    for focus in focus_areas:
        # Update focus area in workflow
        config.prompt_template = config.prompt_template.format(
            focus_area=focus,
            context="{context}"
        )
        
        entry = await collab.execute_next_step(workflow_id)
        print(f"\nImprovement round ({focus}):\n{entry.content[:200]}...")

if __name__ == "__main__":
    async def main():
        print("Running story collaboration example...")
        await story_collaboration_example()
        
        print("\nRunning debate example...")
        await debate_example()
        
        print("\nRunning custom workflow example...")
        await custom_workflow_example()

    asyncio.run(main())
