"""Session Statistics and Analytics Service."""

from datetime import datetime, timedelta
from typing import Dict, List, Any
import struct log

from claude_code_api.core.database import AsyncSessionLocal, Session, Message
from sqlalchemy import select, func

logger = structlog.get_logger()


class SessionStatsService:
    """Provides analytics and statistics for sessions."""

    async def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """Get comprehensive session statistics."""
        async with AsyncSessionLocal() as session:
            # Get session
            result = await session.execute(
                select(Session).where(Session.id == session_id)
            )
            session_obj = result.scalar_one_or_none()

            if not session_obj:
                return None

            # Get message stats
            msg_result = await session.execute(
                select(
                    func.count(Message.id).label('total_messages'),
                    func.sum(Message.input_tokens).label('total_input_tokens'),
                    func.sum(Message.output_tokens).label('total_output_tokens'),
                    func.sum(Message.cost).label('total_cost'),
                ).where(Message.session_id == session_id)
            )
            stats = msg_result.one()

            duration = datetime.utcnow() - session_obj.created_at

            return {
                "session_id": session_id,
                "project_id": session_obj.project_id,
                "model": session_obj.model,
                "created_at": session_obj.created_at.isoformat(),
                "duration_seconds": int(duration.total_seconds()),
                "message_count": stats.total_messages or 0,
                "input_tokens": stats.total_input_tokens or 0,
                "output_tokens": stats.total_output_tokens or 0,
                "total_cost_usd": float(stats.total_cost or 0),
                "messages_per_minute": (stats.total_messages or 0) / (duration.total_seconds() / 60) if duration.total_seconds() > 0 else 0,
            }

    async def get_project_stats(self, project_id: str) -> Dict[str, Any]:
        """Get statistics for all sessions in a project."""
        async with AsyncSessionLocal() as session:
            # Get all sessions for project
            result = await session.execute(
                select(Session).where(Session.project_id == project_id)
            )
            sessions = result.scalars().all()

            total_sessions = len(sessions)
            active_sessions = sum(1 for s in sessions if s.is_active)
            total_tokens = sum(s.total_tokens for s in sessions)
            total_cost = sum(s.total_cost for s in sessions)
            total_messages = sum(s.message_count for s in sessions)

            return {
                "project_id": project_id,
                "total_sessions": total_sessions,
                "active_sessions": active_sessions,
                "total_messages": total_messages,
                "total_tokens": total_tokens,
                "total_cost_usd": float(total_cost),
                "avg_tokens_per_session": total_tokens / total_sessions if total_sessions > 0 else 0,
                "models_used": list(set(s.model for s in sessions)),
            }

    async def get_global_stats(self) -> Dict[str, Any]:
        """Get system-wide statistics."""
        async with AsyncSessionLocal() as session:
            # Count sessions
            session_count = await session.execute(select(func.count(Session.id)))
            total_sessions = session_count.scalar()

            # Count messages
            message_count = await session.execute(select(func.count(Message.id)))
            total_messages = message_count.scalar()

            # Sum tokens and cost
            token_result = await session.execute(
                select(
                    func.sum(Session.total_tokens),
                    func.sum(Session.total_cost)
                )
            )
            totals = token_result.one()

            return {
                "total_sessions": total_sessions,
                "total_messages": total_messages,
                "total_tokens": totals[0] or 0,
                "total_cost_usd": float(totals[1] or 0),
                "avg_messages_per_session": total_messages / total_sessions if total_sessions > 0 else 0,
            }

    async def get_recent_activity(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get recent session activity."""
        async with AsyncSessionLocal() as session:
            cutoff = datetime.utcnow() - timedelta(hours=hours)

            result = await session.execute(
                select(Session)
                .where(Session.updated_at >= cutoff)
                .order_by(Session.updated_at.desc())
                .limit(50)
            )
            sessions = result.scalars().all()

            return [
                {
                    "session_id": s.id,
                    "project_id": s.project_id,
                    "model": s.model,
                    "updated_at": s.updated_at.isoformat(),
                    "message_count": s.message_count,
                    "total_tokens": s.total_tokens,
                }
                for s in sessions
            ]
