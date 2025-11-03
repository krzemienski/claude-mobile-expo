"""Admin endpoints for system management."""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
import structlog

from claude_code_api.core.database import DatabaseManager, AsyncSessionLocal
from claude_code_api.services.cache_service import cache_service
from claude_code_api.services.rate_limiter_advanced import SlidingWindowRateLimiter
from claude_code_api.middleware.rate_limit import rate_limiter
from sqlalchemy import text

logger = structlog.get_logger()
router = APIRouter()


class AdminStats(BaseModel):
    """Admin statistics response."""
    database_size_bytes: int
    total_sessions: int
    total_projects: int
    total_mcp_servers: int
    cache_entries: int
    rate_limit_clients: int


@router.get("/admin/stats")
async def get_admin_stats() -> AdminStats:
    """Get comprehensive admin statistics."""
    async with AsyncSessionLocal() as session:
        # Database size (approximate from row counts)
        sessions_count = await session.execute(text("SELECT COUNT(*) FROM sessions"))
        projects_count = await session.execute(text("SELECT COUNT(*) FROM projects"))
        mcp_count = await session.execute(text("SELECT COUNT(*) FROM mcp_servers"))
        
        sessions_total = sessions_count.scalar()
        projects_total = projects_count.scalar()
        mcp_total = mcp_count.scalar()
        
        # Cache stats
        cache_stats = cache_service.get_stats()
        
        # Rate limiter stats
        rate_stats = rate_limiter.get_stats()
        
        return AdminStats(
            database_size_bytes=0,  # Would need file size check
            total_sessions=sessions_total,
            total_projects=projects_total,
            total_mcp_servers=mcp_total,
            cache_entries=cache_stats.get("active_entries", 0),
            rate_limit_clients=rate_stats.get("active_clients", 0)
        )


@router.post("/admin/cache/clear")
async def clear_cache() -> dict:
    """Clear all cached data."""
    cache_service.clear_all()
    logger.info("Cache cleared by admin")
    return {"success": True, "message": "Cache cleared"}


@router.post("/admin/rate-limit/reset/{client_id}")
async def reset_rate_limit(client_id: str) -> dict:
    """Reset rate limit for specific client."""
    rate_limiter.reset(client_id)
    logger.info("Rate limit reset", client_id=client_id)
    return {"success": True, "message": f"Rate limit reset for {client_id}"}


@router.get("/admin/rate-limit/stats")
async def get_rate_limit_stats() -> dict:
    """Get rate limiting statistics."""
    return rate_limiter.get_stats()


@router.post("/admin/database/vacuum")
async def vacuum_database() -> dict:
    """Vacuum SQLite database to optimize."""
    async with AsyncSessionLocal() as session:
        await session.execute(text("VACUUM"))
        logger.info("Database vacuumed")
        return {"success": True, "message": "Database optimized"}


@router.get("/admin/sessions/inactive")
async def list_inactive_sessions(hours: int = 24) -> List[dict]:
    """List inactive sessions for cleanup."""
    from datetime import datetime, timedelta
    from sqlalchemy import select
    from claude_code_api.core.database import Session
    
    async with AsyncSessionLocal() as db_session:
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        result = await db_session.execute(
            select(Session)
            .where(Session.updated_at < cutoff)
            .where(Session.is_active == True)
        )
        sessions = result.scalars().all()
        
        return [
            {
                "id": s.id,
                "project_id": s.project_id,
                "updated_at": s.updated_at.isoformat(),
                "hours_inactive": (datetime.utcnow() - s.updated_at).total_seconds() / 3600
            }
            for s in sessions
        ]


@router.delete("/admin/sessions/cleanup")
async def cleanup_inactive_sessions(hours: int = 168) -> dict:
    """Cleanup sessions inactive for N hours (default 1 week)."""
    from datetime import datetime, timedelta
    from sqlalchemy import delete
    from claude_code_api.core.database import Session
    
    async with AsyncSessionLocal() as db_session:
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        result = await db_session.execute(
            delete(Session)
            .where(Session.updated_at < cutoff)
            .where(Session.is_active == False)
        )
        await db_session.commit()
        
        deleted_count = result.rowcount
        logger.info("Inactive sessions cleaned up", count=deleted_count, cutoff_hours=hours)
        
        return {"success": True, "deleted": deleted_count, "cutoff_hours": hours}
