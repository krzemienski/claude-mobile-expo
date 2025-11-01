"""Application monitoring endpoints."""

from fastapi import APIRouter
import structlog

from claude_code_api.utils.metrics import metrics

logger = structlog.get_logger()
router = APIRouter()


@router.get("/monitoring/metrics")
async def get_metrics():
    """Get application metrics."""
    return metrics.get_stats()


@router.post("/monitoring/metrics/reset")
async def reset_metrics():
    """Reset all metrics."""
    metrics.reset()
    return {"success": True, "message": "Metrics reset"}


@router.get("/monitoring/endpoints")
async def get_endpoint_metrics():
    """Get per-endpoint metrics."""
    stats = metrics.get_stats()

    endpoint_metrics = {}
    for counter_name, count in stats.get("counters", {}).items():
        if counter_name.startswith("endpoint_"):
            endpoint = counter_name.replace("endpoint_", "")
            endpoint_metrics[endpoint] = {"requests": count}

    return endpoint_metrics
