"""File operations Pydantic models."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class FileInfoModel(BaseModel):
    """File information model."""
    name: str = Field(..., description="File or directory name")
    path: str = Field(..., description="Full file path")
    size: int = Field(..., description="File size in bytes")
    modified: datetime = Field(..., description="Last modified timestamp")
    type: str = Field(..., description="Type: 'file' or 'directory'")
    permissions: Optional[str] = Field(None, description="File permissions (octal)")


class ListFilesRequest(BaseModel):
    """List files request."""
    path: str = Field(..., description="Directory path to list")
    pattern: str = Field("*", description="Glob pattern (e.g., '*.py', '**/*.ts')")
    include_hidden: bool = Field(False, description="Include hidden files")


class ReadFileRequest(BaseModel):
    """Read file request."""
    path: str = Field(..., description="File path to read")
    encoding: str = Field("utf-8", description="Text encoding")


class WriteFileRequest(BaseModel):
    """Write file request."""
    path: str = Field(..., description="File path to write")
    content: str = Field(..., description="File content")
    encoding: str = Field("utf-8", description="Text encoding")
    create_dirs: bool = Field(False, description="Create parent directories if needed")


class SearchFilesRequest(BaseModel):
    """Search files request."""
    root: str = Field(..., description="Root directory to search")
    query: str = Field(..., description="Search query (filename substring)")
    pattern: str = Field("*", description="Glob pattern filter")
    max_results: int = Field(100, ge=1, le=1000, description="Maximum results")


class WatchDirectoryRequest(BaseModel):
    """Watch directory request."""
    path: str = Field(..., description="Directory path to watch")
    patterns: Optional[List[str]] = Field(None, description="File patterns to watch")


class WatchDirectoryResponse(BaseModel):
    """Watch directory response."""
    watch_id: str = Field(..., description="Watch identifier")
    path: str = Field(..., description="Directory being watched")
    patterns: List[str] = Field(..., description="File patterns")


class FileOperationResponse(BaseModel):
    """Generic file operation response."""
    success: bool = Field(..., description="Operation success status")
    message: Optional[str] = Field(None, description="Optional message")
    data: Optional[FileInfoModel] = Field(None, description="File info if applicable")
