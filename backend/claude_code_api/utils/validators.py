"""Input validation utilities."""

import re
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status


def validate_path_safe(path: str, allowed_roots: list[str]) -> Path:
    """
    Validate path is safe and within allowed roots.

    Raises HTTPException if invalid.
    """
    try:
        resolved = Path(path).resolve()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid path: {e}"
        )

    for root in allowed_roots:
        root_path = Path(root).resolve()
        try:
            resolved.relative_to(root_path)
            return resolved
        except ValueError:
            continue

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Path not in allowed directories"
    )


def validate_git_repo(path: str) -> Path:
    """Validate path is a git repository."""
    repo_path = validate_path_safe(path, ["/Users", "/tmp"])

    if not (repo_path / ".git").exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not a git repository: {path}"
        )

    return repo_path


def validate_model_id(model: str) -> str:
    """Validate Claude model ID."""
    valid_models = [
        "claude-opus-4-20250514",
        "claude-sonnet-4-20250514",
        "claude-3-7-sonnet-20250219",
        "claude-3-5-haiku-20241022",
    ]

    if model not in valid_models:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid model: {model}. Valid: {valid_models}"
        )

    return model


def validate_session_id(session_id: str) -> str:
    """Validate session ID format (UUID)."""
    uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

    if not re.match(uuid_pattern, session_id, re.IGNORECASE):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid session ID format"
        )

    return session_id


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal."""
    # Remove path separators
    filename = filename.replace("/", "_").replace("\\", "_")

    # Remove parent directory references
    filename = filename.replace("..", "_")

    # Remove null bytes
    filename = filename.replace("\x00", "")

    return filename


def validate_pagination(page: int, per_page: int) -> tuple[int, int]:
    """Validate pagination parameters."""
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page must be >= 1"
        )

    if per_page < 1 or per_page > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Per page must be between 1 and 100"
        )

    return page, per_page
