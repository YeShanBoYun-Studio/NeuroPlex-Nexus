import sqlite3
from datetime import datetime
import uuid

class TextCache:
    def __init__(self, db_path='data/cache.db'):
        self.db_path = db_path
        self._initialize_db()

    def _initialize_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''CREATE TABLE IF NOT EXISTS cache
                         (step_id TEXT PRIMARY KEY,
                          content TEXT,
                          prompt TEXT,
                          parent_id TEXT,
                          author TEXT,
                          timestamp DATETIME)''')

    def add_entry(self, entry: dict):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''INSERT INTO cache VALUES 
                         (:step_id, :content, :prompt, 
                          :parent_id, :author, :timestamp)''',
                         entry)

    def get_branch(self, root_id: str) -> list:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                WITH RECURSIVE tree AS (
                    SELECT * FROM cache WHERE step_id = ?
                    UNION ALL
                    SELECT c.* FROM cache c
                    JOIN tree t ON c.parent_id = t.step_id
                )
                SELECT * FROM tree''', (root_id,))
            return [dict(row) for row in cursor.fetchall()]

def build_context(history: list, max_tokens=4000) -> str:
    token_count = sum(len(item['content']) for item in history)
    if token_count > max_tokens:
        return _compress_context(history[-5:])
    return '\n\n'.join([f"【步骤{item['step_id']}】{item['content']}" for item in history])

def _compress_context(history: list) -> str:
    key_points = [f"- {item['content'][:100]}..." for item in history]
    return "历史摘要：\n" + '\n'.join(key_points)
