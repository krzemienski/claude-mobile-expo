"""Database backup and restore service."""

import shutil
import gzip
from pathlib import Path
from datetime import datetime
from typing import List, Dict
import structlog

logger = structlog.get_logger()


class BackupService:
    """Manages database backups."""

    def __init__(self, db_path: str, backup_dir: str = "./backups"):
        self.db_path = Path(db_path)
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(exist_ok=True)

    def create_backup(self, compress: bool = True) -> str:
        """Create database backup."""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        backup_name = f"claude_api_{timestamp}.db"

        if compress:
            backup_name += ".gz"
            backup_path = self.backup_dir / backup_name

            with open(self.db_path, 'rb') as f_in:
                with gzip.open(backup_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
        else:
            backup_path = self.backup_dir / backup_name
            shutil.copy2(self.db_path, backup_path)

        logger.info("Backup created", path=str(backup_path), size=backup_path.stat().st_size)

        return str(backup_path)

    def list_backups(self) -> List[Dict]:
        """List all backups."""
        backups = []

        for backup_file in sorted(self.backup_dir.glob("claude_api_*.db*")):
            stat = backup_file.stat()
            backups.append({
                "filename": backup_file.name,
                "path": str(backup_file),
                "size_bytes": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })

        return backups

    def restore_backup(self, backup_filename: str):
        """Restore database from backup."""
        backup_path = self.backup_dir / backup_filename

        if not backup_path.exists():
            raise FileNotFoundError(f"Backup not found: {backup_filename}")

        # Create backup of current database first
        current_backup = self.create_backup()
        logger.info("Created safety backup of current database", path=current_backup)

        try:
            if backup_filename.endswith('.gz'):
                # Decompress
                with gzip.open(backup_path, 'rb') as f_in:
                    with open(self.db_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
            else:
                shutil.copy2(backup_path, self.db_path)

            logger.info("Database restored", from_backup=backup_filename)

        except Exception as e:
            logger.error("Restore failed", error=str(e))
            raise

    def cleanup_old_backups(self, keep_count: int = 10):
        """Remove old backups, keeping most recent N."""
        backups = sorted(
            self.backup_dir.glob("claude_api_*.db*"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )

        removed = 0
        for backup in backups[keep_count:]:
            backup.unlink()
            removed += 1

        logger.info("Old backups cleaned up", removed=removed, kept=keep_count)

        return removed
