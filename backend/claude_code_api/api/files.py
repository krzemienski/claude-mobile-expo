"""File Operations API - OpenAI-compatible extension."""

from typing import List
from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import JSONResponse
import structlog

from claude_code_api.models.files import (
    FileInfoModel,
    ListFilesRequest,
    ReadFileRequest,
    WriteFileRequest,
    SearchFilesRequest,
    WatchDirectoryRequest,
    WatchDirectoryResponse,
    FileOperationResponse,
)
from claude_code_api.services.file_operations import (
    FileOperationsService,
    FileNotFoundError as ServiceFileNotFoundError,
    PermissionDeniedError as ServicePermissionDeniedError,
    InvalidPathError as ServiceInvalidPathError,
)

logger = structlog.get_logger()
router = APIRouter()

# Initialize file service with configurable allowed paths
# For development: Allow broad access. For production: Restrict to project directories.
file_service = FileOperationsService(
    allowed_paths=[
        "/Users",  # macOS home directories
        "/tmp",    # Temporary files
        "/var",    # System temp (includes /private/var on macOS)
    ]
)


def _convert_file_info(file_info) -> FileInfoModel:
    """Convert service FileInfo to Pydantic model."""
    return FileInfoModel(
        name=file_info.name,
        path=file_info.path,
        size=file_info.size,
        modified=file_info.modified,
        type=file_info.type,
        permissions=file_info.permissions,
    )


@router.get("/files/list")
async def list_files(
    path: str = Query(..., description="Directory path"),
    pattern: str = Query("*", description="Glob pattern"),
    hidden: bool = Query(False, description="Include hidden files"),
) -> List[FileInfoModel]:
    """List files in directory with optional filtering."""
    try:
        files = file_service.list_files(path, pattern=pattern, include_hidden=hidden)
        return [_convert_file_info(f) for f in files]

    except ServiceFileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ServicePermissionDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ServiceInvalidPathError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("list_files error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list files: {str(e)}"
        )


@router.get("/files/read")
async def read_file(
    path: str = Query(..., description="File path"),
    encoding: str = Query("utf-8", description="Text encoding"),
) -> dict:
    """Read file content."""
    try:
        content = file_service.read_file(path, encoding=encoding)

        # Get file info for metadata
        file_info = file_service.get_file_info(path)

        return {
            "content": content,
            "path": path,
            "encoding": encoding,
            "size": file_info.size,
        }

    except ServiceFileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ServicePermissionDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ServiceInvalidPathError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("read_file error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read file: {str(e)}"
        )


@router.post("/files/write")
async def write_file(request: WriteFileRequest) -> FileInfoModel:
    """Write content to file."""
    try:
        file_info = file_service.write_file(
            path=request.path,
            content=request.content,
            encoding=request.encoding,
            create_dirs=request.create_dirs,
        )
        return _convert_file_info(file_info)

    except ServicePermissionDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ServiceInvalidPathError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("write_file error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write file: {str(e)}"
        )


@router.delete("/files/delete")
async def delete_file(path: str = Query(..., description="File path")) -> dict:
    """Delete file (not directories for safety)."""
    try:
        file_service.delete_file(path)
        return {"success": True, "message": f"File deleted: {path}"}

    except ServiceFileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ServicePermissionDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ServiceInvalidPathError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("delete_file error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )


@router.get("/files/search")
async def search_files(
    root: str = Query(..., description="Root directory"),
    query: str = Query(..., description="Search query"),
    pattern: str = Query("*", description="Glob pattern"),
    max: int = Query(100, ge=1, le=1000, description="Max results"),
) -> List[FileInfoModel]:
    """Search for files by name."""
    try:
        results = file_service.search_files(
            root=root,
            query=query,
            pattern=pattern,
            max_results=max,
        )
        return [_convert_file_info(f) for f in results]

    except ServiceFileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ServicePermissionDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        logger.error("search_files error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search files: {str(e)}"
        )


@router.get("/files/info")
async def get_file_info(path: str = Query(..., description="File path")) -> FileInfoModel:
    """Get detailed file metadata."""
    try:
        file_info = file_service.get_file_info(path)
        return _convert_file_info(file_info)

    except ServiceFileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ServicePermissionDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except Exception as e:
        logger.error("get_file_info error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get file info: {str(e)}"
        )


@router.post("/files/watch")
async def watch_directory(request: WatchDirectoryRequest) -> WatchDirectoryResponse:
    """Start watching directory for changes."""
    try:
        watch_id = file_service.watch_directory(
            path=request.path,
            patterns=request.patterns,
        )

        return WatchDirectoryResponse(
            watch_id=watch_id,
            path=request.path,
            patterns=request.patterns or ["*"],
        )

    except ServiceFileNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ServicePermissionDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ServiceInvalidPathError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error("watch_directory error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to watch directory: {str(e)}"
        )
