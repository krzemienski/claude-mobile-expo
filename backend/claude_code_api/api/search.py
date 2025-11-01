"""Unified Search API - Search across files, git history, sessions."""

from typing import List, Literal
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
import structlog

logger = structlog.get_logger()
router = APIRouter()


class SearchResult(BaseModel):
    """Unified search result."""
    type: Literal["file", "commit", "session", "message"]
    title: str
    preview: str
    path: Optional[str] = None
    score: float = Field(ge=0.0, le=1.0)
    metadata: dict = Field(default_factory=dict)


@router.get("/search")
async def unified_search(
    query: str = Query(..., min_length=2, description="Search query"),
    types: List[str] = Query(["file", "commit"], description="Result types to include"),
    limit: int = Query(20, ge=1, le=100, description="Max results"),
) -> List[SearchResult]:
    """
    Search across files, git commits, sessions, and messages.

    Combines results from multiple sources for unified search experience.
    """
    results = []

    # For v2.0: Basic implementation
    # Would need to:
    # 1. Search files with file_service.search_files()
    # 2. Search git log with git_service.get_log()
    # 3. Search session titles/messages in database
    # 4. Rank and merge results
    # 5. Apply limit

    logger.info("Unified search", query=query, types=types)

    # Placeholder
    results.append(SearchResult(
        type="file",
        title=f"Search for '{query}' in files",
        preview="File search not yet implemented",
        score=0.5,
    ))

    return results[:limit]


from typing import Optional
