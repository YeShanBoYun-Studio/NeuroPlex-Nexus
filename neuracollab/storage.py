"""
Storage implementation for the NeuraCollab cache pool.
"""

import sqlite3
from datetime import datetime
from contextlib import contextmanager
from typing import List, Optional, Dict, Any
from uuid import UUID
import json

from .models import CacheEntry

class SQLiteConnector:
    """
    SQLite-based persistent storage for the cache pool.
    """
    def __init__(self, db_path: str = "neuracollab.db"):
        self.db_path = db_path
        self._initialize_db()

    @contextmanager
    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def _initialize_db(self):
        """Create required tables if they don't exist."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS cache_entries (
                    entry_id TEXT PRIMARY KEY,
                    parent_id TEXT,
                    content TEXT NOT NULL,
                    prompt TEXT NOT NULL,
                    author TEXT NOT NULL,
                    timestamp DATETIME NOT NULL,
                    metadata TEXT,
                    FOREIGN KEY (parent_id) REFERENCES cache_entries (entry_id)
                )
            """)
            conn.commit()

    def insert(self, entry: CacheEntry) -> UUID:
        """Insert a new cache entry."""
        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO cache_entries 
                (entry_id, parent_id, content, prompt, author, timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                str(entry.entry_id),
                str(entry.parent_id) if entry.parent_id else None,
                entry.content,
                entry.prompt,
                entry.author,
                entry.timestamp.isoformat(),
                json.dumps(entry.metadata)
            ))
            conn.commit()
        return entry.entry_id

    def get(self, entry_id: UUID) -> Optional[CacheEntry]:
        """Retrieve a specific cache entry."""
        with self._get_connection() as conn:
            result = conn.execute("""
                SELECT * FROM cache_entries WHERE entry_id = ?
            """, (str(entry_id),)).fetchone()
            
            if not result:
                return None
                
            return CacheEntry(
                entry_id=UUID(result["entry_id"]),
                parent_id=UUID(result["parent_id"]) if result["parent_id"] else None,
                content=result["content"],
                prompt=result["prompt"],
                author=result["author"],
                timestamp=datetime.fromisoformat(result["timestamp"]),
                metadata=json.loads(result["metadata"])
            )

    def get_branch(self, entry_id: UUID) -> List[CacheEntry]:
        """Get all entries in a branch starting from the given entry."""
        with self._get_connection() as conn:
            results = conn.execute("""
                WITH RECURSIVE branch AS (
                    SELECT * FROM cache_entries WHERE entry_id = ?
                    UNION ALL
                    SELECT e.*
                    FROM cache_entries e
                    JOIN branch b ON e.parent_id = b.entry_id
                )
                SELECT * FROM branch
                ORDER BY timestamp ASC
            """, (str(entry_id),)).fetchall()
            
            return [
                CacheEntry(
                    entry_id=UUID(r["entry_id"]),
                    parent_id=UUID(r["parent_id"]) if r["parent_id"] else None,
                    content=r["content"],
                    prompt=r["prompt"],
                    author=r["author"],
                    timestamp=datetime.fromisoformat(r["timestamp"]),
                    metadata=json.loads(r["metadata"])
                )
                for r in results
            ]

    def get_children(self, entry_id: UUID) -> List[CacheEntry]:
        """Get direct child entries of the given entry."""
        with self._get_connection() as conn:
            results = conn.execute("""
                SELECT * FROM cache_entries WHERE parent_id = ?
            """, (str(entry_id),)).fetchall()
            
            return [
                CacheEntry(
                    entry_id=UUID(r["entry_id"]),
                    parent_id=UUID(r["parent_id"]),
                    content=r["content"],
                    prompt=r["prompt"],
                    author=r["author"],
                    timestamp=datetime.fromisoformat(r["timestamp"]),
                    metadata=json.loads(r["metadata"])
                )
                for r in results
            ]
