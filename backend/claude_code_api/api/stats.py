"""Statistics and Analytics API."""

from fastapi import APIRouter, Query
import structlog

from claude_code_api.services.session_stats import SessionStatsService

logger = structlog.get_logger()
router = APIRouter()

stats_service = SessionStatsService()


@router.get("/stats/session/{session_id}")
async def get_session_stats(session_id: str):
    """Get comprehensive session statistics."""
    stats = await stats_service.get_session_summary(session_id)
    if not stats:
        return {"error": "Session not found"}, 404
    return stats


@router.get("/stats/project/{project_id}")
async def get_project_stats(project_id: str):
    """Get statistics for all sessions in project."""
    return await stats_service.get_project_stats(project_id)


@router.get("/stats/global")
async def get_global_stats():
    """Get system-wide statistics."""
    return await stats_service.get_global_stats()


@router.get("/stats/recent")
async def get_recent_activity(hours: int = Query(24, ge=1, le=168)):
    """Get recent session activity."""
    return await stats_service.get_recent_activity(hours)
