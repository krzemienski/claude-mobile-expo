"""MCP Server Management Service."""

import json
import uuid
from pathlib import Path
from typing import List, Dict, Optional, Any
from datetime import datetime
import structlog

from claude_code_api.core.database import db_manager, MCPServer, AsyncSessionLocal
from claude_code_api.core.encryption import encryption_service

logger = structlog.get_logger()


class MCPManagerService:
    """Manages MCP server configurations."""

    async def list_servers(self) -> List[dict]:
        """Get all configured MCP servers."""
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select
            result = await session.execute(select(MCPServer))
            servers = result.scalars().all()

            return [
                {
                    "id": s.id,
                    "name": s.name,
                    "url": s.url,
                    "transport": s.transport,
                    "enabled": s.enabled,
                    "tools_count": s.tools_count,
                    "last_used": s.last_used.isoformat() if s.last_used else None,
                }
                for s in servers
            ]

    async def add_server(self, config: dict) -> dict:
        """
        Add new MCP server.

        Args:
            config: MCP configuration dict

        Returns:
            Created MCP server info
        """
        async with AsyncSessionLocal() as session:
            # Encrypt API key if provided
            api_key_encrypted = None
            if config.get("api_key"):
                api_key_encrypted = encryption_service.encrypt(config["api_key"])

            mcp_server = MCPServer(
                id=str(uuid.uuid4()),
                name=config["name"],
                url=config.get("url"),
                transport=config.get("transport", "http"),
                command=config.get("command"),
                args=json.dumps(config.get("args", [])),
                env_vars=json.dumps(config.get("env", {})),
                api_key_encrypted=api_key_encrypted,
                enabled=True,
                tools_count=0,
            )

            session.add(mcp_server)
            await session.commit()
            await session.refresh(mcp_server)

            logger.info("MCP server added", name=config["name"], transport=config.get("transport"))

            return {
                "id": mcp_server.id,
                "name": mcp_server.name,
                "url": mcp_server.url,
                "transport": mcp_server.transport,
            }

    async def remove_server(self, name: str) -> bool:
        """Remove MCP server by name."""
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, delete

            # Find server
            result = await session.execute(
                select(MCPServer).where(MCPServer.name == name)
            )
            server = result.scalar_one_or_none()

            if not server:
                return False

            # Delete
            await session.execute(
                delete(MCPServer).where(MCPServer.name == name)
            )
            await session.commit()

            logger.info("MCP server removed", name=name)
            return True

    async def enable_server(self, name: str, session_id: str) -> bool:
        """Enable MCP server for session."""
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, update

            result = await session.execute(
                update(MCPServer)
                .where(MCPServer.name == name)
                .values(enabled=True, last_used=datetime.utcnow())
            )
            await session.commit()

            logger.info("MCP server enabled", name=name, session_id=session_id)
            return result.rowcount > 0

    async def disable_server(self, name: str, session_id: str) -> bool:
        """Disable MCP server for session."""
        async with AsyncSessionLocal() as session:
            from sqlalchemy import update

            result = await session.execute(
                update(MCPServer)
                .where(MCPServer.name == name)
                .values(enabled=False)
            )
            await session.commit()

            logger.info("MCP server disabled", name=name, session_id=session_id)
            return result.rowcount > 0

    async def test_connection(self, name: str) -> dict:
        """Test MCP server connection."""
        # For v2.0: Basic implementation, just return success
        # Full connection testing would require MCP protocol implementation
        logger.info("MCP connection test", name=name)
        return {"status": "success", "message": "Connection test not yet implemented"}

    async def get_tools(self, name: str) -> List[dict]:
        """Get available tools from MCP server."""
        # For v2.0: Return empty list, actual tool discovery needs MCP protocol
        logger.info("MCP tools list requested", name=name)
        return []

    async def execute_tool(self, name: str, tool_name: str, input_data: dict) -> dict:
        """Execute MCP tool."""
        # For v2.0: Not implemented, would require MCP protocol
        logger.info("MCP tool execution requested", mcp=name, tool=tool_name)
        return {"status": "not_implemented"}

    async def sync_with_claude_cli(self) -> int:
        """
        Sync MCP configurations from Claude CLI's mcp.json file.

        Reads ~/.config/claude/mcp.json and imports MCP configurations.

        Returns:
            Number of MCPs imported
        """
        mcp_config_path = Path.home() / ".config" / "claude" / "mcp.json"

        if not mcp_config_path.exists():
            logger.warning("Claude CLI mcp.json not found", path=str(mcp_config_path))
            return 0

        try:
            config_data = json.loads(mcp_config_path.read_text())
            mcp_servers = config_data.get("mcpServers", {})

            count = 0
            for name, server_config in mcp_servers.items():
                # Check if already exists
                existing = await self.list_servers()
                if any(s["name"] == name for s in existing):
                    logger.debug("MCP server already exists, skipping", name=name)
                    continue

                # Add to database
                await self.add_server({
                    "name": name,
                    "url": server_config.get("url"),
                    "transport": "http" if server_config.get("url") else "stdio",
                    "command": server_config.get("command"),
                    "args": server_config.get("args", []),
                    "env": server_config.get("env", {}),
                })
                count += 1

            logger.info("Claude CLI MCP sync complete", imported=count)
            return count

        except Exception as e:
            logger.error("Failed to sync from Claude CLI", error=str(e))
            raise
