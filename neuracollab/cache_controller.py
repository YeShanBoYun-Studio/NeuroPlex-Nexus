"""
Controller for cache operations and settings management.
"""
import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException

from .cache_pool import NeuralCachePool
from .models import CacheSettings

logger = logging.getLogger(__name__)
router = APIRouter()

def get_cache_controller(cache_pool: NeuralCachePool):
    """Create a router with cache endpoints."""
    
    @router.get("/settings")
    async def get_cache_settings() -> Dict[str, Any]:
        """Get current cache settings."""
        try:
            return {
                "max_size_mb": cache_pool.max_size_mb,
                "compression_enabled": cache_pool.compression_enabled,
                "compression_threshold": cache_pool.compression_threshold,
                "current_size": cache_pool.current_size,
                "entry_count": len(cache_pool.entries)
            }
        except Exception as e:
            logger.error(f"Failed to get cache settings: {e}")
            raise HTTPException(status_code=500, detail="Failed to get cache settings")

    @router.post("/settings")
    async def update_cache_settings(settings: CacheSettings) -> Dict[str, str]:
        """Update cache settings."""
        try:
            # Update settings
            cache_pool.max_size_mb = settings.max_size_mb
            cache_pool.compression_enabled = settings.compression_enabled
            cache_pool.compression_threshold = settings.compression_threshold
            
            # Apply compression if enabled
            if settings.compression_enabled:
                await cache_pool.compress_entries()

            return {"status": "Settings updated successfully"}
        except Exception as e:
            logger.error(f"Failed to update cache settings: {e}")
            raise HTTPException(status_code=500, detail="Failed to update cache settings")

    @router.post("/clear")
    async def clear_cache() -> Dict[str, str]:
        """Clear all entries from cache."""
        try:
            cache_pool.clear()
            return {"status": "Cache cleared successfully"}
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            raise HTTPException(status_code=500, detail="Failed to clear cache")

    @router.get("/stats")
    async def get_cache_stats() -> Dict[str, Any]:
        """Get cache statistics."""
        try:
            stats = {
                "total_entries": len(cache_pool.entries),
                "size_mb": cache_pool.current_size,
                "compression_ratio": cache_pool.get_compression_ratio(),
                "hit_rate": cache_pool.get_hit_rate(),
                "miss_rate": cache_pool.get_miss_rate()
            }
            return stats
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            raise HTTPException(status_code=500, detail="Failed to get cache statistics")

    @router.post("/optimize")
    async def optimize_cache() -> Dict[str, Any]:
        """Optimize cache storage."""
        try:
            initial_size = cache_pool.current_size
            entries_before = len(cache_pool.entries)
            
            # Perform optimization
            await cache_pool.optimize()
            
            return {
                "status": "Cache optimized successfully",
                "size_reduction": initial_size - cache_pool.current_size,
                "entries_removed": entries_before - len(cache_pool.entries)
            }
        except Exception as e:
            logger.error(f"Failed to optimize cache: {e}")
            raise HTTPException(status_code=500, detail="Failed to optimize cache")

    @router.post("/vacuum")
    async def vacuum_cache() -> Dict[str, str]:
        """Vacuum cache to reclaim space."""
        try:
            await cache_pool.vacuum()
            return {"status": "Cache vacuum completed successfully"}
        except Exception as e:
            logger.error(f"Failed to vacuum cache: {e}")
            raise HTTPException(status_code=500, detail="Failed to vacuum cache")

    return router
