"""Host System Discovery API - Find Claude Code projects on host machine."""

from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from pathlib import Path
import structlog

from claude_code_api.services.file_operations import (
    FileOperationsService,
    FileNotFoundError as ServiceFileNotFoundError,
    PermissionDeniedError as ServicePermissionDeniedError,
)

logger = structlog.get_logger()
router = APIRouter()

# File service for browsing
file_service = FileOperationsService(allowed_paths=["/Users", "/tmp", "/var"])


class ProjectDiscoveryResult:
    """Discovered project information."""

    def __init__(
        self,
        name: str,
        path: str,
        has_claudemd: bool,
        has_git: bool,
        session_count: int = 0,
    ):
        self.name = name
        self.path = path
        self.has_claudemd = has_claudemd
        self.has_git = has_git
        self.session_count = session_count


def discover_claude_projects(scan_path: str, max_depth: int = 3) -> List[dict]:
    """
    Scan directory tree for Claude Code projects.

    Identifies projects by:
    - CLAUDE.md file existence
    - .git directory
    - .claude/ directory

    Args:
        scan_path: Root path to scan
        max_depth: Maximum directory depth (performance limit)

    Returns:
        List of discovered projects
    """
    projects = []
    scan_root = Path(scan_path).resolve()

    # Skip these directories for performance
    skip_dirs = {
        'node_modules', '.git', 'venv', '.venv', '__pycache__',
        'dist', 'build', '.next', 'target', 'vendor'
    }

    def scan_directory(current_path: Path, depth: int):
        """Recursively scan directory."""
        if depth > max_depth:
            return

        try:
            # Check if this directory is a Claude Code project
            has_claudemd = (current_path / "CLAUDE.md").exists()
            has_git = (current_path / ".git").exists()
            has_claude_dir = (current_path / ".claude").exists()

            if has_claudemd or has_git or has_claude_dir:
                projects.append({
                    "name": current_path.name,
                    "path": str(current_path),
                    "has_claudemd": has_claudemd,
                    "has_git": has_git,
                    "session_count": 0,  # Will be populated from database in future
                })

            # Scan subdirectories
            for item in current_path.iterdir():
                if item.is_dir() and item.name not in skip_dirs:
                    scan_directory(item, depth + 1)

        except PermissionError:
            # Skip directories we can't access
            pass
        except Exception as e:
            logger.warning(f"Error scanning {current_path}: {e}")

    scan_directory(scan_root, 0)

    logger.info(
        "Project discovery completed",
        scan_path=scan_path,
        projects_found=len(projects)
    )

    return projects


@router.get("/host/discover-projects")
async def discover_projects(
    scan_path: str = Query("/Users/nick", description="Path to scan"),
    max_depth: int = Query(3, ge=1, le=5, description="Max scan depth"),
) -> List[dict]:
    """
    Discover Claude Code projects on host system.

    Scans directory tree for CLAUDE.md, .git, or .claude/ directories.
    """
    try:
        projects = discover_claude_projects(scan_path, max_depth)
        return projects

    except Exception as e:
        logger.error("Project discovery error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to discover projects: {str(e)}"
        )


@router.get("/host/browse")
async def browse_host(path: str = Query(..., description="Directory path")) -> List[dict]:
    """
    Browse host filesystem.

    Returns directory tree for file browser UI.
    """
    try:
        files = file_service.list_files(path, include_hidden=False)

        # Convert to simple dict format for frontend
        result = []
        for f in files:
            result.append({
                "name": f.name,
                "path": f.path,
                "type": f.type,
                "size": f.size,
                "modified": f.modified.isoformat(),
            })

        return result

    except ServiceFileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ServicePermissionDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        logger.error("browse_host error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to browse: {str(e)}"
        )
