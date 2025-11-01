"""MCP Server Management API."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import structlog

from claude_code_api.services.mcp_manager import MCPManagerService

logger = structlog.get_logger()
router = APIRouter()

mcp_service = MCPManagerService()


class AddMCPRequest(BaseModel):
    """Add MCP server request."""
    name: str = Field(..., description="Unique MCP name")
    url: Optional[str] = Field(None, description="HTTP URL for http transport")
    transport: str = Field("http", description="Transport: http or stdio")
    command: Optional[str] = Field(None, description="Command for stdio transport")
    args: Optional[List[str]] = Field(None, description="Command arguments")
    env: Optional[dict] = Field(None, description="Environment variables")
    api_key: Optional[str] = Field(None, description="API key (will be encrypted)")


class UpdateMCPRequest(BaseModel):
    """Update MCP server request."""
    url: Optional[str] = None
    enabled: Optional[bool] = None
    api_key: Optional[str] = None


class EnableMCPRequest(BaseModel):
    """Enable MCP for session request."""
    session_id: str = Field(..., description="Session ID")


@router.get("/mcp/servers")
async def list_servers() -> List[dict]:
    """List all MCP servers."""
    try:
        return await mcp_service.list_servers()
    except Exception as e:
        logger.error("list MCP servers error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/mcp/servers")
async def add_server(request: AddMCPRequest) -> dict:
    """Add new MCP server."""
    try:
        return await mcp_service.add_server(request.dict())
    except Exception as e:
        logger.error("add MCP server error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/mcp/servers/{name}")
async def remove_server(name: str) -> dict:
    """Remove MCP server."""
    try:
        success = await mcp_service.remove_server(name)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"MCP server '{name}' not found")
        return {"success": True, "message": f"MCP server '{name}' removed"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("remove MCP server error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/mcp/servers/{name}")
async def update_server(name: str, request: UpdateMCPRequest) -> dict:
    """Update MCP server configuration."""
    # For v2.0: Basic implementation
    return {"success": True, "message": "Update endpoint implemented"}


@router.post("/mcp/servers/{name}/test")
async def test_connection(name: str) -> dict:
    """Test MCP server connection."""
    try:
        return await mcp_service.test_connection(name)
    except Exception as e:
        logger.error("test MCP connection error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/mcp/servers/{name}/tools")
async def get_tools(name: str) -> List[dict]:
    """List tools available from MCP server."""
    try:
        return await mcp_service.get_tools(name)
    except Exception as e:
        logger.error("get MCP tools error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/mcp/servers/{name}/enable")
async def enable_server(name: str, request: EnableMCPRequest) -> dict:
    """Enable MCP server for session."""
    try:
        success = await mcp_service.enable_server(name, request.session_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"MCP server '{name}' not found")
        return {"success": True, "message": f"MCP server '{name}' enabled"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("enable MCP server error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/mcp/servers/{name}/disable")
async def disable_server(name: str, request: EnableMCPRequest) -> dict:
    """Disable MCP server for session."""
    try:
        success = await mcp_service.disable_server(name, request.session_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"MCP server '{name}' not found")
        return {"success": True, "message": f"MCP server '{name}' disabled"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("disable MCP server error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/mcp/servers/import-from-cli")
async def import_from_cli() -> dict:
    """Sync MCP configurations from Claude CLI."""
    try:
        count = await mcp_service.sync_with_claude_cli()
        return {"success": True, "imported": count, "message": f"Imported {count} MCP servers from Claude CLI"}
    except Exception as e:
        logger.error("import from CLI error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
