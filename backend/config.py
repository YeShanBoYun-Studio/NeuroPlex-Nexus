import os

class Config:
    FRONTEND_BUILD_DIR = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'frontend/build'
    )
    SQLITE_DB_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'data/cache.db'
    )

config = Config()
