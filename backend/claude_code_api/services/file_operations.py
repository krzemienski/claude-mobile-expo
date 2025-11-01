"""
File Operations Service

Provides secure file system access with:
- Path validation (prevent directory traversal)
- Glob pattern support
- Encoding detection
- Metadata extraction
- File watching (basic implementation)

Security: All paths validated against allowed_paths
"""

import os
import glob as glob_module
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Dict, Any
import structlog

logger = structlog.get_logger()


# Custom Exceptions
class FileNotFoundError(Exception):
    """File or directory not found."""
    pass


class PermissionDeniedError(Exception):
    """Access denied to path."""
    pass


class InvalidPathError(Exception):
    """Invalid path or operation."""
    pass


class FileInfo:
    """File metadata container."""

    def __init__(
        self,
        name: str,
        path: str,
        size: int,
        modified: datetime,
        file_type: str,
        permissions: Optional[str] = None,
    ):
        self.name = name
        self.path = path
        self.size = size
        self.modified = modified
        self.type = file_type
        self.permissions = permissions


class FileOperationsService:
    """Secure file operations service."""

    def __init__(self, allowed_paths: List[str]):
        """
        Initialize with allowed base paths.

        Args:
            allowed_paths: List of allowed base directories
        """
        self.allowed_paths = [Path(p).resolve() for p in allowed_paths]
        self.active_watchers: Dict[str, Any] = {}

        logger.info(
            "FileOperationsService initialized",
            allowed_paths=[str(p) for p in self.allowed_paths]
        )

    def _validate_path(self, path: str) -> Path:
        """
        Validate path is within allowed directories.

        Args:
            path: Path to validate

        Returns:
            Resolved Path object

        Raises:
            PermissionDeniedError: If path outside allowed directories
        """
        try:
            resolved_path = Path(path).resolve()
        except Exception as e:
            raise InvalidPathError(f"Invalid path: {e}")

        # Check if path is within any allowed path
        for allowed in self.allowed_paths:
            try:
                # Check if resolved path is relative to allowed path
                resolved_path.relative_to(allowed)
                return resolved_path
            except ValueError:
                # Not relative to this allowed path, try next
                continue

        # Path not in any allowed directory
        raise PermissionDeniedError(
            f"Path '{path}' is not in allowed paths: {[str(p) for p in self.allowed_paths]}"
        )

    def list_files(
        self,
        path: str,
        pattern: str = "*",
        include_hidden: bool = False
    ) -> List[FileInfo]:
        """
        List files in directory with optional filtering.

        Args:
            path: Directory path
            pattern: Glob pattern (e.g., '*.py', '**/*.ts')
            include_hidden: Include hidden files (starting with .)

        Returns:
            List of FileInfo objects

        Raises:
            FileNotFoundError: Directory doesn't exist
            PermissionDeniedError: Path not allowed
        """
        # Check existence BEFORE permission to give better error messages
        try:
            path_obj = Path(path).resolve()
        except Exception as e:
            raise InvalidPathError(f"Invalid path: {e}")

        if not path_obj.exists():
            raise FileNotFoundError(f"Directory not found: {path}")

        # Now validate path is allowed
        validated_path = self._validate_path(path)

        if not validated_path.is_dir():
            raise InvalidPathError(f"Not a directory: {path}")

        results = []

        # Use glob for pattern matching
        if "**" in pattern:
            # Recursive glob
            matches = validated_path.rglob(pattern.replace("**/", ""))
        else:
            # Non-recursive glob
            matches = validated_path.glob(pattern)

        for item_path in matches:
            # Skip hidden files if requested
            if not include_hidden and item_path.name.startswith("."):
                continue

            try:
                stat = item_path.stat()
                file_info = FileInfo(
                    name=item_path.name,
                    path=str(item_path),
                    size=stat.st_size,
                    modified=datetime.fromtimestamp(stat.st_mtime),
                    file_type="directory" if item_path.is_dir() else "file",
                    permissions=oct(stat.st_mode)[-3:],
                )
                results.append(file_info)
            except Exception as e:
                logger.warning(f"Failed to stat {item_path}: {e}")
                continue

        logger.debug(
            "Listed files",
            path=path,
            pattern=pattern,
            count=len(results)
        )

        return results

    def read_file(self, path: str, encoding: str = "utf-8") -> str:
        """
        Read file content.

        Args:
            path: File path
            encoding: Text encoding (default: utf-8)

        Returns:
            File content as string

        Raises:
            FileNotFoundError: File doesn't exist
            PermissionDeniedError: Path not allowed
            InvalidPathError: Path is directory or binary file
        """
        # SECURITY: Validate permission FIRST before checking existence
        validated_path = self._validate_path(path)

        if not validated_path.exists():
            raise FileNotFoundError(f"File not found: {path}")

        if validated_path.is_dir():
            raise InvalidPathError(f"Cannot read directory as file: {path}")

        # Check if file is binary
        try:
            content = validated_path.read_text(encoding=encoding)
            logger.debug("File read successfully", path=path, size=len(content))
            return content
        except UnicodeDecodeError:
            raise InvalidPathError(f"Cannot read binary file: {path}")
        except Exception as e:
            logger.error(f"Failed to read file {path}: {e}")
            raise

    def write_file(
        self,
        path: str,
        content: str,
        encoding: str = "utf-8",
        create_dirs: bool = False
    ) -> FileInfo:
        """
        Write content to file.

        Args:
            path: File path
            content: Content to write
            encoding: Text encoding
            create_dirs: Create parent directories if needed

        Returns:
            FileInfo for created/updated file

        Raises:
            PermissionDeniedError: Path not allowed
        """
        validated_path = self._validate_path(path)

        # Create parent directories if requested
        if create_dirs:
            validated_path.parent.mkdir(parents=True, exist_ok=True)

        # Write content
        validated_path.write_text(content, encoding=encoding)

        # Return file info
        stat = validated_path.stat()
        file_info = FileInfo(
            name=validated_path.name,
            path=str(validated_path),
            size=stat.st_size,
            modified=datetime.fromtimestamp(stat.st_mtime),
            file_type="file",
            permissions=oct(stat.st_mode)[-3:],
        )

        logger.info("File written", path=path, size=len(content))

        return file_info

    def delete_file(self, path: str) -> None:
        """
        Delete file (not directories for safety).

        Args:
            path: File path to delete

        Raises:
            FileNotFoundError: File doesn't exist
            PermissionDeniedError: Path not allowed
            InvalidPathError: Path is directory
        """
        validated_path = self._validate_path(path)

        if not validated_path.exists():
            raise FileNotFoundError(f"File not found: {path}")

        if validated_path.is_dir():
            raise InvalidPathError(f"Cannot delete directory (safety): {path}")

        validated_path.unlink()

        logger.info("File deleted", path=path)

    def search_files(
        self,
        root: str,
        query: str,
        pattern: str = "*",
        max_results: int = 100
    ) -> List[FileInfo]:
        """
        Search for files by name.

        Args:
            root: Root directory to search
            query: Search query (substring match on filename)
            pattern: Glob pattern to filter results
            max_results: Maximum number of results

        Returns:
            List of matching FileInfo objects
        """
        validated_root = self._validate_path(root)

        if not validated_root.exists():
            raise FileNotFoundError(f"Root directory not found: {root}")

        results = []

        # Walk directory tree
        for item_path in validated_root.rglob(pattern):
            # Check if query matches filename
            if query.lower() in item_path.name.lower():
                try:
                    stat = item_path.stat()
                    file_info = FileInfo(
                        name=item_path.name,
                        path=str(item_path),
                        size=stat.st_size,
                        modified=datetime.fromtimestamp(stat.st_mtime),
                        file_type="directory" if item_path.is_dir() else "file",
                    )
                    results.append(file_info)

                    if len(results) >= max_results:
                        break
                except Exception as e:
                    logger.warning(f"Failed to process {item_path}: {e}")
                    continue

        logger.debug(
            "File search completed",
            root=root,
            query=query,
            results=len(results)
        )

        return results

    def get_file_info(self, path: str) -> FileInfo:
        """
        Get detailed file metadata.

        Args:
            path: File or directory path

        Returns:
            FileInfo with complete metadata

        Raises:
            FileNotFoundError: Path doesn't exist
            PermissionDeniedError: Path not allowed
        """
        validated_path = self._validate_path(path)

        if not validated_path.exists():
            raise FileNotFoundError(f"Path not found: {path}")

        stat = validated_path.stat()

        file_info = FileInfo(
            name=validated_path.name,
            path=str(validated_path),
            size=stat.st_size if not validated_path.is_dir() else 0,
            modified=datetime.fromtimestamp(stat.st_mtime),
            file_type="directory" if validated_path.is_dir() else "file",
            permissions=oct(stat.st_mode)[-3:],
        )

        logger.debug("File info retrieved", path=path)

        return file_info

    def watch_directory(
        self,
        path: str,
        patterns: Optional[List[str]] = None
    ) -> str:
        """
        Start watching directory for changes (basic implementation).

        For v2.0: Just returns watch_id, actual event streaming is future.

        Args:
            path: Directory to watch
            patterns: File patterns to watch (e.g., ['*.py', '*.ts'])

        Returns:
            watch_id for tracking this watcher

        Raises:
            FileNotFoundError: Directory doesn't exist
            PermissionDeniedError: Path not allowed
        """
        validated_path = self._validate_path(path)

        if not validated_path.exists():
            raise FileNotFoundError(f"Directory not found: {path}")

        if not validated_path.is_dir():
            raise InvalidPathError(f"Not a directory: {path}")

        # Generate watch ID
        watch_id = str(uuid.uuid4())

        # Store watcher metadata (actual watching implementation is Phase 9)
        self.active_watchers[watch_id] = {
            "path": str(validated_path),
            "patterns": patterns or ["*"],
            "created_at": datetime.utcnow(),
        }

        logger.info(
            "Directory watch started",
            path=path,
            watch_id=watch_id,
            patterns=patterns
        )

        return watch_id

    def stop_watch(self, watch_id: str) -> None:
        """Stop watching directory."""
        if watch_id in self.active_watchers:
            del self.active_watchers[watch_id]
            logger.info("Directory watch stopped", watch_id=watch_id)
