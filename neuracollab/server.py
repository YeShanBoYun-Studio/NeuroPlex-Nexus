"""
FastAPI server implementation for NeuraCollab.
Following OpenAPI 3.0 specification.
"""
from contextlib import asynccontextmanager
import logging
import os
from typing import Dict

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer

from .cache_pool import NeuralCachePool
from .engine import CollaborationEngine
from .dispatcher import LLMDispatcher
from .adapters.llm_adapters import create_adapter
from .init_db import init_database
from .ai_config import AIConfigManager

from .workflow_controller import get_workflow_controller
from .cache_controller import get_cache_controller
from .branch_controller import get_branch_controller
from .ai_config_controller import get_ai_config_controller
from .websocket_controller import (
    get_websocket_router,
    create_websocket_manager
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OAuth2 for future auth implementation
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    try:
        # Initialize database
        init_database()
        logger.info("Database initialized successfully")
        
        # Initialize core components
        app.state.cache_pool = NeuralCachePool()
        app.state.ai_config = AIConfigManager()
        app.state.dispatcher = LLMDispatcher()
        app.state.engine = CollaborationEngine(app.state.cache_pool)
        
        # Initialize WebSocket manager
        app.state.ws_manager = create_websocket_manager(
            app.state.cache_pool,
            app.state.engine
        )
        
        # Load AI configurations
        await load_ai_configs(app)
        
        # Register controllers
        setup_routers(app)
        
        logger.info("Application initialized successfully")
        yield
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise
    finally:
        logger.info("Application shutting down")

def setup_routers(app: FastAPI):
    """Setup API routers."""
    # Register workflow controller
    app.include_router(
        get_workflow_controller(
            app.state.engine,
            app.state.dispatcher,
            app.state.cache_pool,
            app.state.ws_manager
        ),
        prefix="/workflows",
        tags=["workflows"]
    )
    
    # Register cache controller
    app.include_router(
        get_cache_controller(app.state.cache_pool),
        prefix="/cache",
        tags=["cache"]
    )
    
    # Register branch controller
    app.include_router(
        get_branch_controller(app.state.engine, app.state.cache_pool),
        prefix="/branches",
        tags=["branches"]
    )

    # Register AI config controller
    app.include_router(
        get_ai_config_controller(app.state.ai_config, app.state.dispatcher),
        prefix="/ai/configs",
        tags=["ai-configs"]
    )

    # Register WebSocket controller
    app.include_router(
        get_websocket_router(app.state.ws_manager),
        tags=["websocket"]
    )

async def load_ai_configs(app: FastAPI):
    """Load and register AI configurations."""
    configs = app.state.ai_config.list_configs()
    for config in configs:
        if config.is_active:
            try:
                adapter = create_adapter(config.provider, config.credentials)
                app.state.dispatcher.register_adapter(config.name, adapter)
                logger.info(f"Registered AI adapter: {config.name}")
            except Exception as e:
                logger.error(f"Failed to load AI config {config.name}: {e}")

# Create FastAPI application
app = FastAPI(
    title="NeuraCollab API",
    description="AI Collaboration Platform API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global error handler for all unhandled exceptions."""
    logger.error(f"Global error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)}
    )

@app.get("/health")
async def health_check():
    """API health check endpoint."""
    ws_connections = len(app.state.ws_manager.active_connections)
    active_models = app.state.dispatcher.get_available_models()
    cache_stats = {
        "size": app.state.cache_pool.current_size,
        "entries": len(app.state.cache_pool.entries)
    }
    
    return {
        "status": "healthy",
        "version": "0.1.0",
        "active_models": active_models,
        "cache_stats": cache_stats,
        "websocket_connections": ws_connections
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
