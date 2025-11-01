"""File Upload API - Multipart file upload support."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
import structlog
import shutil
from pathlib import Path

from claude_code_api.services.file_operations import (
    FileOperationsService,
    PermissionDeniedError as ServicePermissionDeniedError,
)
from claude_code_api.models.files import FileInfoModel

logger = structlog.get_logger()
router = APIRouter()

file_service = FileOperationsService(
    allowed_paths=["/Users", "/tmp", "/var"]
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


@router.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    destination: str = Form(...),
    overwrite: bool = Form(False),
) -> FileInfoModel:
    """
    Upload file via multipart/form-data.

    Useful for mobile apps to upload photos, documents, etc.
    """
    try:
        # Validate destination path
        dest_path = Path(destination)
        if dest_path.exists() and not overwrite:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"File already exists: {destination}. Set overwrite=true to replace."
            )

        # Read uploaded file content
        content = await file.read()

        # Write using file service (validates path security)
        with open("/tmp/temp_upload", "wb") as f:
            f.write(content)

        # Move to destination via file service for security validation
        file_info = file_service.write_file(
            path=destination,
            content=content.decode('utf-8'),
            create_dirs=True
        )

        logger.info("File uploaded", destination=destination, size=len(content))

        return _convert_file_info(file_info)

    except ServicePermissionDeniedError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except UnicodeDecodeError:
        # Binary file - write as binary
        validated_path = file_service._validate_path(destination)
        validated_path.parent.mkdir(parents=True, exist_ok=True)
        with open(validated_path, 'wb') as f:
            f.write(content)

        stat = validated_path.stat()
        return FileInfoModel(
            name=validated_path.name,
            path=str(validated_path),
            size=stat.st_size,
            modified=stat.st_mtime,
            type="file",
            permissions=oct(stat.st_mode)[-3:],
        )
    except Exception as e:
        logger.error("upload_file error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.post("/files/upload/multiple")
async def upload_multiple_files(
    files: list[UploadFile] = File(...),
    destination_dir: str = Form(...),
) -> list[FileInfoModel]:
    """Upload multiple files to directory."""
    results = []

    for file in files:
        dest = f"{destination_dir}/{file.filename}"
        try:
            content = await file.read()
            file_info = file_service.write_file(
                path=dest,
                content=content.decode('utf-8'),
                create_dirs=True
            )
            results.append(_convert_file_info(file_info))
        except Exception as e:
            logger.error(f"Failed to upload {file.filename}", error=str(e))
            # Continue with other files

    return results
