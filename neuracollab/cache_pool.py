"""
Neural Cache Pool - Core implementation for the NeuraCollab system.
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
import re
import nltk
from nltk.tokenize import sent_tokenize
from datetime import datetime

from .models import CacheEntry, WorkflowConfig
from .storage import SQLiteConnector

class ContextCompressor:
    """Intelligent context compression for managing token limits."""
    def __init__(self):
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')
        self.enabled = True
        self.threshold = 0.8

    def compress(self, text: str, target_length: int = 2000) -> str:
        """Compress text while preserving key information."""
        sentences = sent_tokenize(text)
        if len(sentences) <= 3:
            return text

        densities = []
        for sentence in sentences:
            density = sum([
                2 if re.search(r'\d+', sentence) else 0,
                3 if re.search(r'therefore|thus|hence|conclude', sentence, re.I) else 0,
                2 if re.search(r'important|significant|key|critical', sentence, re.I) else 0,
                1 if len(sentence.split()) > 5 else 0
            ])
            densities.append(density)

        selected = [sentences[0]]
        middle_sentences = list(zip(sentences[1:-1], densities[1:-1]))
        middle_sentences.sort(key=lambda x: x[1], reverse=True)
        
        current_length = len(selected[0])
        for sentence, _ in middle_sentences:
            if current_length + len(sentence) > target_length:
                break
            selected.append(sentence)
            current_length += len(sentence)

        if current_length + len(sentences[-1]) <= target_length:
            selected.append(sentences[-1])

        return " ".join(selected)

class NeuralCachePool:
    """Intelligent cache pool management engine."""
    def __init__(self, max_context_length: int = 16000):
        self.storage = SQLiteConnector()
        self.compressor = ContextCompressor()
        self.max_context = max_context_length
        self._summarizer = None

    def set_summarizer(self, summarizer: Any):
        """Set the summarizer instance."""
        self._summarizer = summarizer

    async def add_entry(self, entry: CacheEntry) -> UUID:
        """Add a new entry to the cache pool."""
        if self._summarizer:
            summary = await self._summarizer.generate(entry.content)
            entry.metadata['summary'] = summary
        return self.storage.insert(entry)

    def get_context(self, current_id: UUID, config: WorkflowConfig) -> str:
        """Generate context based on configuration rules."""
        history = self._get_relevant_history(current_id, config)
        raw_text = self._build_raw_context(history, config)
        
        if len(raw_text) > self.max_context:
            return self.compressor.compress(raw_text)
        return raw_text

    def _get_relevant_history(self, current_id: UUID, config: WorkflowConfig) -> List[CacheEntry]:
        """Get relevant historical entries based on inheritance rules."""
        full_history = self.storage.get_branch(current_id)
        
        if config.inheritance_rules.get("last_3_steps"):
            return full_history[-3:]
        elif config.inheritance_rules.get("full_history"):
            return full_history
        else:
            return [
                entry for entry in full_history
                if self._should_include_entry(entry, config)
            ]

    def _build_raw_context(self, history: List[CacheEntry], config: WorkflowConfig) -> str:
        """Build context from historical entries."""
        context_parts = []
        
        for entry in history:
            if 'summary' in entry.metadata:
                context_parts.append(f"Summary of step {entry.entry_id}:\n{entry.metadata['summary']}")
            else:
                if config.inheritance_rules.get("prompt_chain"):
                    context_parts.append(f"[Prompt: {entry.prompt}]")
                context_parts.append(f"{entry.content}")

        return "\n\n".join(context_parts)

    def _should_include_entry(self, entry: CacheEntry, config: WorkflowConfig) -> bool:
        """Determine if an entry should be included based on rules."""
        if config.mode == "debate":
            return "position" in entry.metadata
        elif config.mode == "relay":
            return "role" in entry.metadata
        return True

    def create_branch(self, base_id: UUID, new_prompt: str) -> UUID:
        """Create a new branch from an existing entry."""
        base_entry = self.storage.get(base_id)
        if not base_entry:
            raise ValueError(f"Base entry {base_id} not found")
            
        new_entry = CacheEntry(
            parent_id=base_id,
            content=base_entry.content,
            prompt=new_prompt,
            author="System:Branch",
            metadata={"branch_from": str(base_id)}
        )
        return self.storage.insert(new_entry)
