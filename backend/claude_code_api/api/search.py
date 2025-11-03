"""Unified search API across all content types."""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel
import structlog

from claude_code_api.services.file_operations import FileOperationsService
from claude_code_api.services.git_operations import GitOperationsService
from claude_code_api.core.database import AsyncSessionLocal, Session as DBSession, Message
from sqlalchemy import select, or_

logger = structlog.get_logger()
router = APIRouter()

file_service = FileOperationsService(allowed_paths=["/Users", "/tmp", "/var"])
git_service = GitOperationsService()


class SearchResult(BaseModel):
    """Single search result."""
    type: str  # "file", "session", "commit", "skill", "agent"
    title: str
    description: str
    path: Optional[str] = None
    url: Optional[str] = None
    metadata: Dict[str, Any] = {}
    score: float = 1.0  # Relevance score


class SearchResponse(BaseModel):
    """Unified search response."""
    query: str
    results: List[SearchResult]
    total: int
    categories: Dict[str, int]  # Count per category


@router.get("/search")
async def unified_search(
    query: str = Query(..., description="Search query", min_length=2),
    types: Optional[List[str]] = Query(None, description="Filter by types: file, session, commit, skill, agent"),
    max_results: int = Query(50, ge=1, le=200, description="Maximum results"),
    project_path: Optional[str] = Query(None, description="Limit to project")
) -> SearchResponse:
    """
    Unified search across all content types.
    
    Searches:
    - Files (by name)
    - Sessions (by project_id or title)
    - Git commits (by message)
    - Skills (by name or description)
    - Agents (by name or description)
    
    Returns ranked results with relevance scores.
    """
    all_results = []
    filter_types = set(types) if types else {"file", "session", "commit", "skill", "agent"}
    
    # Search files
    if "file" in filter_types and project_path:
        try:
            files = file_service.search_files(
                root=project_path,
                query=query,
                max_results=max_results // 5  # Allocate 1/5 of results to each category
            )
            for file_info in files:
                all_results.append(SearchResult(
                    type="file",
                    title=file_info.name,
                    description=f"{file_info.type.title()} • {file_info.size} bytes",
                    path=file_info.path,
                    metadata={"size": file_info.size, "type": file_info.type},
                    score=_calculate_file_score(query, file_info.name)
                ))
        except Exception as e:
            logger.warning("File search failed", error=str(e))
    
    # Search sessions
    if "session" in filter_types:
        try:
            async with AsyncSessionLocal() as session:
                # Search by project_id or title
                stmt = select(DBSession).where(
                    or_(
                        DBSession.project_id.contains(query),
                        DBSession.title.contains(query) if DBSession.title else False
                    )
                ).limit(max_results // 5)
                
                result = await session.execute(stmt)
                sessions = result.scalars().all()
                
                for sess in sessions:
                    all_results.append(SearchResult(
                        type="session",
                        title=sess.title or f"Session {sess.id[:8]}",
                        description=f"Project: {sess.project_id} • Model: {sess.model}",
                        metadata={
                            "id": sess.id,
                            "project_id": sess.project_id,
                            "model": sess.model,
                            "message_count": sess.message_count
                        },
                        score=_calculate_session_score(query, sess)
                    ))
        except Exception as e:
            logger.warning("Session search failed", error=str(e))
    
    # Search git commits
    if "commit" in filter_types and project_path:
        try:
            commits = git_service.get_log(project_path, max_count=20)
            matching_commits = [
                c for c in commits
                if query.lower() in c["message"].lower()
            ][:max_results // 5]
            
            for commit in matching_commits:
                all_results.append(SearchResult(
                    type="commit",
                    title=commit["message"][:100],
                    description=f"{commit['author']} • {commit['short_sha']}",
                    metadata={
                        "sha": commit["sha"],
                        "author": commit["author"],
                        "timestamp": commit["timestamp"]
                    },
                    score=_calculate_commit_score(query, commit["message"])
                ))
        except Exception as e:
            logger.warning("Commit search failed", error=str(e))
    
    # Search skills
    if "skill" in filter_types:
        # Would search ~/.claude/skills/ - placeholder for now
        pass
    
    # Search agents
    if "agent" in filter_types:
        # Would search ~/.claude/agents/ - placeholder for now
        pass
    
    # Sort by relevance score
    all_results.sort(key=lambda r: r.score, reverse=True)
    
    # Limit total results
    all_results = all_results[:max_results]
    
    # Count by category
    categories = {}
    for result in all_results:
        categories[result.type] = categories.get(result.type, 0) + 1
    
    logger.info(
        "Search completed",
        query=query,
        total_results=len(all_results),
        categories=categories
    )
    
    return SearchResponse(
        query=query,
        results=all_results,
        total=len(all_results),
        categories=categories
    )


def _calculate_file_score(query: str, filename: str) -> float:
    """Calculate relevance score for file."""
    query_lower = query.lower()
    filename_lower = filename.lower()
    
    # Exact match
    if query_lower == filename_lower:
        return 1.0
    
    # Starts with query
    if filename_lower.startswith(query_lower):
        return 0.9
    
    # Contains query
    if query_lower in filename_lower:
        return 0.7
    
    # Fuzzy match (simple)
    matching_chars = sum(1 for c in query_lower if c in filename_lower)
    return matching_chars / len(query_lower) * 0.5


def _calculate_session_score(query: str, session: DBSession) -> float:
    """Calculate relevance score for session."""
    query_lower = query.lower()
    
    # Match in project_id
    if query_lower in session.project_id.lower():
        return 0.8
    
    # Match in title
    if session.title and query_lower in session.title.lower():
        return 0.9
    
    return 0.3


def _calculate_commit_score(query: str, message: str) -> float:
    """Calculate relevance score for commit."""
    query_lower = query.lower()
    message_lower = message.lower()
    
    # Exact phrase match
    if query_lower in message_lower:
        return 0.9
    
    # Word match
    query_words = set(query_lower.split())
    message_words = set(message_lower.split())
    matching_words = query_words.intersection(message_words)
    
    if matching_words:
        return len(matching_words) / len(query_words) * 0.7
    
    return 0.3
