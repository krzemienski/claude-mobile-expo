"""Admin API - System administration endpoints."""

from fastapi import APIRouter, HTTPException, status
import structlog

from claude_code_api.services.cache_service import cache_service

logger = structlog.get_logger()
router = APIRouter()


@router.get("/admin/cache/stats")
async def get_cache_stats():
    """Get cache statistics."""
    return cache_service.get_stats()


@router.post("/admin/cache/clear")
async def clear_cache(namespace: Optional[str] = None):
    """Clear cache (all or specific namespace)."""
    if namespace:
        cache_service.invalidate_namespace(namespace)
        return {"message": f"Cache namespace '{namespace}' cleared"}
    else:
        cache_service.clear_all()
        return {"message": "All cache cleared"}


@router.get("/admin/system/info")
async def get_system_info():
    """Get system information."""
    import platform
    import psutil
    import sys

    return {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "python_version": sys.version,
        "cpu_count": psutil.cpu_count(),
        "memory_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
        "memory_available_gb": round(psutil.virtual_memory().available / (1024**3), 2),
        "disk_usage_percent": psutil.disk_usage('/').percent,
    }


@router.get("/admin/routes")
async def list_routes(req: Request):
    """List all registered API routes."""
    routes = []
    for route in req.app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": route.name,
            })

    return {"routes": routes, "total": len(routes)}


from typing import Optional
from fastapi import Request
