"""Git Operations API."""

from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
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


class CommitRequest(BaseModel):
    """Commit request model."""
    project_path: str = Field(..., description="Repository path")
    message: str = Field(..., description="Commit message")
    files: Optional[List[str]] = Field(None, description="Files to stage (None = all)")
    author: Optional[dict] = Field(None, description="Author with name and email")


class CreateBranchRequest(BaseModel):
    """Create branch request."""
    project_path: str = Field(..., description="Repository path")
    name: str = Field(..., description="Branch name")
    from_branch: Optional[str] = Field(None, description="Source branch")


class CheckoutRequest(BaseModel):
    """Checkout branch request."""
    project_path: str = Field(..., description="Repository path")
    name: str = Field(..., description="Branch name")


@router.get("/git/status")
async def get_status(project_path: str = Query(..., description="Repository path")) -> dict:
    """Get git status."""
    try:
        return git_service.get_status(project_path)
    except GitNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("git status error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/git/commit")
async def create_commit(request: CommitRequest) -> dict:
    """Create git commit."""
    try:
        return git_service.create_commit(
            repo_path=request.project_path,
            message=request.message,
            files=request.files,
            author=request.author
        )
    except GitNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except GitOperationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("git commit error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/git/log")
async def get_log(
    project_path: str = Query(..., description="Repository path"),
    max: int = Query(50, ge=1, le=200, description="Max commits"),
    skip: int = Query(0, ge=0, description="Skip count for pagination"),
    file: Optional[str] = Query(None, description="File path filter"),
) -> List[dict]:
    """Get commit log."""
    try:
        return git_service.get_log(repo_path=project_path, max_count=max, skip=skip, file_path=file)
    except GitNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("git log error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/git/diff")
async def get_diff(
    project_path: str = Query(..., description="Repository path"),
    staged: bool = Query(False, description="Show staged changes"),
    file: Optional[str] = Query(None, description="File path filter"),
    context: int = Query(3, ge=0, le=10, description="Context lines"),
) -> dict:
    """Get git diff."""
    try:
        diff = git_service.get_diff(
            repo_path=project_path,
            staged=staged,
            file_path=file,
            context_lines=context
        )
        return {"diff": diff}
    except GitNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("git diff error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/git/branches")
async def get_branches(
    project_path: str = Query(..., description="Repository path"),
    remote: bool = Query(False, description="Include remote branches"),
) -> List[dict]:
    """List git branches."""
    try:
        return git_service.get_branches(repo_path=project_path, include_remote=remote)
    except GitNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("git branches error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/git/branch/create")
async def create_branch(request: CreateBranchRequest) -> dict:
    """Create new branch."""
    try:
        return git_service.create_branch(
            repo_path=request.project_path,
            branch_name=request.name,
            from_branch=request.from_branch
        )
    except GitNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except GitOperationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("create branch error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/git/branch/checkout")
async def checkout_branch(request: CheckoutRequest) -> dict:
    """Checkout branch."""
    try:
        return git_service.checkout_branch(repo_path=request.project_path, branch_name=request.name)
    except GitNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except GitOperationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("checkout branch error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/git/remotes")
async def get_remotes(project_path: str = Query(..., description="Repository path")) -> List[dict]:
    """Get remote information."""
    try:
        return git_service.get_remote_info(repo_path=project_path)
    except GitNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("git remotes error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
