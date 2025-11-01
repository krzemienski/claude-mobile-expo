"""Git Remote Operations API - Push/Pull/Fetch."""

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import structlog

from claude_code_api.services.git_operations import (
    GitOperationsService,
    GitNotFoundError,
    GitOperationError,
)

logger = structlog.get_logger()
router = APIRouter()

git_service = GitOperationsService()


class GitPushRequest(BaseModel):
    """Git push request."""
    project_path: str = Field(..., description="Repository path")
    remote: str = Field("origin", description="Remote name")
    branch: Optional[str] = Field(None, description="Branch to push (default: current)")
    force: bool = Field(False, description="Force push")


class GitPullRequest(BaseModel):
    """Git pull request."""
    project_path: str = Field(..., description="Repository path")
    remote: str = Field("origin", description="Remote name")
    branch: Optional[str] = Field(None, description="Branch to pull (default: current)")


@router.post("/git/push")
async def git_push(request: GitPushRequest) -> dict:
    """Push commits to remote (NOT IMPLEMENTED for safety)."""
    # For v2.0: Not implemented for safety
    # Would need user confirmation before pushing
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Git push not implemented in v2.0 (safety feature). Use local git client."
    )


@router.post("/git/pull")
async def git_pull(request: GitPullRequest) -> dict:
    """Pull commits from remote (NOT IMPLEMENTED for safety)."""
    # For v2.0: Not implemented
    # Pulling could overwrite local changes
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Git pull not implemented in v2.0. Use local git client."
    )


@router.post("/git/fetch")
async def git_fetch(request: GitPullRequest) -> dict:
    """Fetch from remote (NOT IMPLEMENTED)."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Git fetch not implemented in v2.0. Use local git client."
    )
