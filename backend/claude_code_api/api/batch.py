"""Batch operations API for efficient multi-operation requests."""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import structlog
import asyncio

from claude_code_api.services.file_operations import FileOperationsService
from claude_code_api.services.git_operations import GitOperationsService

logger = structlog.get_logger()
router = APIRouter()

file_service = FileOperationsService(allowed_paths=["/Users", "/tmp", "/var"])
git_service = GitOperationsService()


class BatchOperation(BaseModel):
    """Single batch operation."""
    operation: str = Field(..., description="Operation type: file_read, file_write, git_status, etc.")
    params: Dict[str, Any] = Field(..., description="Operation parameters")


class BatchRequest(BaseModel):
    """Batch operations request."""
    operations: List[BatchOperation] = Field(..., description="List of operations to execute")
    fail_fast: bool = Field(False, description="Stop on first error")


class BatchOperationResult(BaseModel):
    """Single operation result."""
    operation: str
    success: bool
    data: Any = None
    error: str = None


class BatchResponse(BaseModel):
    """Batch operations response."""
    results: List[BatchOperationResult]
    total: int
    successful: int
    failed: int


@router.post("/batch")
async def execute_batch_operations(request: BatchRequest) -> BatchResponse:
    """
    Execute multiple operations in a single request.
    
    Supported operations:
    - file_read: Read file content
    - file_write: Write file content
    - file_list: List files in directory
    - git_status: Get git status
    - git_log: Get commit log
    
    Example:
    {
      "operations": [
        {"operation": "file_read", "params": {"path": "/tmp/file1.txt"}},
        {"operation": "git_status", "params": {"project_path": "/path/to/repo"}}
      ],
      "fail_fast": false
    }
    """
    results = []
    
    for op in request.operations:
        try:
            result = await execute_single_operation(op)
            results.append(BatchOperationResult(
                operation=op.operation,
                success=True,
                data=result
            ))
        except Exception as e:
            logger.error("Batch operation failed", operation=op.operation, error=str(e))
            results.append(BatchOperationResult(
                operation=op.operation,
                success=False,
                error=str(e)
            ))
            
            if request.fail_fast:
                break
    
    successful = sum(1 for r in results if r.success)
    failed = len(results) - successful
    
    return BatchResponse(
        results=results,
        total=len(results),
        successful=successful,
        failed=failed
    )


async def execute_single_operation(operation: BatchOperation) -> Any:
    """Execute a single batch operation."""
    op_type = operation.operation
    params = operation.params
    
    # File operations
    if op_type == "file_read":
        content = file_service.read_file(params["path"])
        return {"content": content, "path": params["path"]}
    
    elif op_type == "file_write":
        file_info = file_service.write_file(
            params["path"],
            params["content"],
            create_dirs=params.get("create_dirs", False)
        )
        return {"path": file_info.path, "size": file_info.size}
    
    elif op_type == "file_list":
        files = file_service.list_files(
            params["path"],
            pattern=params.get("pattern", "*"),
            include_hidden=params.get("hidden", False)
        )
        return [{"name": f.name, "type": f.type, "size": f.size} for f in files]
    
    # Git operations
    elif op_type == "git_status":
        return git_service.get_status(params["project_path"])
    
    elif op_type == "git_log":
        return git_service.get_log(
            params["project_path"],
            max_count=params.get("max", 10)
        )
    
    elif op_type == "git_commit":
        return git_service.create_commit(
            params["project_path"],
            params["message"],
            files=params.get("files")
        )
    
    else:
        raise ValueError(f"Unknown operation: {op_type}")
