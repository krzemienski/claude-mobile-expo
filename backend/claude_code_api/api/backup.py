"""Database backup API endpoints."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import structlog

from claude_code_api.services.backup_service import BackupService
from claude_code_api.core.config import settings

logger = structlog.get_logger()
router = APIRouter()

backup_service = BackupService(
    db_path=settings.database_url.replace("sqlite:///", "./"),
    backup_dir="./backups"
)


class CreateBackupRequest(BaseModel):
    """Create backup request."""
    compress: bool = Field(True, description="Compress backup with gzip")


@router.post("/backup/create")
async def create_backup(request: CreateBackupRequest):
    """Create database backup."""
    try:
        backup_path = backup_service.create_backup(compress=request.compress)
        return {"success": True, "backup_path": backup_path}
    except Exception as e:
        logger.error("Backup creation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Backup failed: {e}"
        )


@router.get("/backup/list")
async def list_backups():
    """List all database backups."""
    return backup_service.list_backups()


@router.post("/backup/restore/{backup_filename}")
async def restore_backup(backup_filename: str):
    """Restore database from backup."""
    try:
        backup_service.restore_backup(backup_filename)
        return {"success": True, "restored_from": backup_filename}
    except FileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("Restore failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Restore failed: {e}"
        )


@router.post("/backup/cleanup")
async def cleanup_backups(keep: int = 10):
    """Remove old backups."""
    removed = backup_service.cleanup_old_backups(keep_count=keep)
    return {"success": True, "removed": removed}
