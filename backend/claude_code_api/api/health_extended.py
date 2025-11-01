"""Extended health check endpoints."""

from fastapi import APIRouter
import structlog
import psutil
import time

logger = structlog.get_logger()
router = APIRouter()

start_time = time.time()


@router.get("/health/detailed")
async def detailed_health():
    """Detailed health check with system metrics."""
    uptime_seconds = int(time.time() - start_time)

    return {
        "status": "healthy",
        "uptime_seconds": uptime_seconds,
        "memory": {
            "used_mb": round(psutil.Process().memory_info().rss / 1024 / 1024, 2),
            "percent": psutil.Process().memory_percent(),
        },
        "cpu_percent": psutil.Process().cpu_percent(interval=0.1),
        "threads": psutil.Process().num_threads(),
    }


@router.get("/health/readiness")
async def readiness():
    """Readiness probe for orchestration."""
    # Check if critical services are up
    # For v2.0: Simple check
    return {"ready": True}


@router.get("/health/liveness")
async def liveness():
    """Liveness probe for orchestration."""
    return {"alive": True}
