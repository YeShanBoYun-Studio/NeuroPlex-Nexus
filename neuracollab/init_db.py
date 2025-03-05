"""
Database initialization script for NeuraCollab.
"""
import sqlite3
from pathlib import Path

def init_database(db_path: str = "neuracollab.db"):
    """Initialize SQLite database with required tables."""
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Create cache entries table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS cache_entries (
        entry_id TEXT PRIMARY KEY,
        parent_id TEXT,
        content TEXT NOT NULL,
        prompt TEXT NOT NULL,
        author TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata JSON,
        FOREIGN KEY (parent_id) REFERENCES cache_entries(entry_id)
    )
    """)

    # Create workflows table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS workflows (
        workflow_id TEXT PRIMARY KEY,
        mode TEXT NOT NULL,
        config JSON NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create model configs table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS model_configs (
        model_name TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        api_key TEXT,
        parameters JSON,
        fallback_models JSON
    )
    """)

    # Create indexes
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cache_parent ON cache_entries(parent_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cache_timestamp ON cache_entries(timestamp)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_workflow_mode ON workflows(mode)")

    conn.commit()
    conn.close()

def ensure_workspace():
    """Ensure all required directories exist."""
    dirs = [
        "cache",
        "logs",
        "config",
        "config/workflows",
        "config/models",
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)

def init_app():
    """Initialize the application environment."""
    print("Initializing NeuraCollab...")
    
    # Create directories
    ensure_workspace()
    print("✓ Workspace directories created")
    
    # Initialize database
    init_database()
    print("✓ Database initialized")
    
    print("\nNeuraCollab initialization complete!")

if __name__ == "__main__":
    init_app()
