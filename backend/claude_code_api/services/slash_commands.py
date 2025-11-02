"""
Slash Command Service

Handles built-in slash commands:
- /help: Show available commands
- /clear: Clear conversation history
- /status: Show session status
- /files: Quick file browser
- /git: Show git status
"""

from typing import Dict, Any, Optional
from datetime import datetime
import structlog

from claude_code_api.services.file_operations import FileOperationsService
from claude_code_api.services.git_operations import GitOperationsService

logger = structlog.get_logger()


class SlashCommandService:
    """Handles slash command parsing and execution."""

    def __init__(self):
        self.file_service = FileOperationsService(allowed_paths=["/Users", "/tmp", "/var"])
        self.git_service = GitOperationsService()
        
        # Built-in commands
        self.commands = {
            "help": self._help_command,
            "clear": self._clear_command,
            "status": self._status_command,
            "files": self._files_command,
            "git": self._git_command,
        }

    def is_slash_command(self, message: str) -> bool:
        """Check if message is a slash command."""
        return message.strip().startswith("/")

    def parse_command(self, message: str) -> tuple[str, list[str]]:
        """
        Parse slash command into command name and arguments.
        
        Args:
            message: Full message starting with /
            
        Returns:
            (command_name, arguments)
            
        Example:
            "/files /tmp" → ("files", ["/tmp"])
            "/help" → ("help", [])
        """
        parts = message.strip().split()
        command_name = parts[0][1:]  # Remove leading /
        args = parts[1:] if len(parts) > 1 else []
        
        return command_name, args

    async def execute_command(
        self,
        message: str,
        session_id: str,
        project_path: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute slash command and return response.
        
        Args:
            message: Full slash command message
            session_id: Current session ID
            project_path: Current project path
            
        Returns:
            Command response dict with type and content
        """
        command_name, args = self.parse_command(message)
        
        # Check if command exists
        if command_name not in self.commands:
            return {
                "type": "slash_command_error",
                "command": command_name,
                "error": f"Unknown command: /{command_name}",
                "available_commands": list(self.commands.keys()),
            }
        
        # Execute command
        try:
            handler = self.commands[command_name]
            result = await handler(args, session_id, project_path)
            
            logger.info(
                "Slash command executed",
                command=command_name,
                session_id=session_id,
            )
            
            return {
                "type": "slash_command_response",
                "command": command_name,
                "data": result,
                "timestamp": datetime.utcnow().isoformat(),
            }
            
        except Exception as e:
            logger.error(
                "Slash command failed",
                command=command_name,
                error=str(e),
            )
            
            return {
                "type": "slash_command_error",
                "command": command_name,
                "error": str(e),
            }

    async def _help_command(self, args: list[str], session_id: str, project_path: Optional[str]) -> Dict[str, Any]:
        """Show available commands."""
        return {
            "commands": [
                {
                    "name": "help",
                    "description": "Show available slash commands",
                    "usage": "/help",
                },
                {
                    "name": "clear",
                    "description": "Clear conversation history",
                    "usage": "/clear",
                },
                {
                    "name": "status",
                    "description": "Show session status and statistics",
                    "usage": "/status",
                },
                {
                    "name": "files",
                    "description": "List files in directory",
                    "usage": "/files [path]",
                },
                {
                    "name": "git",
                    "description": "Show git status",
                    "usage": "/git [status|log|branches]",
                },
            ],
            "message": "Available slash commands. Type / to see autocomplete menu.",
        }

    async def _clear_command(self, args: list[str], session_id: str, project_path: Optional[str]) -> Dict[str, Any]:
        """Clear conversation history."""
        # This would integrate with session_manager to clear messages
        return {
            "message": "Conversation cleared",
            "session_id": session_id,
            "action": "clear_messages",
        }

    async def _status_command(self, args: list[str], session_id: str, project_path: Optional[str]) -> Dict[str, Any]:
        """Show session status."""
        return {
            "session_id": session_id,
            "project_path": project_path or "Not set",
            "status": "active",
            "message": f"Session {session_id[:8]}... is active",
        }

    async def _files_command(self, args: list[str], session_id: str, project_path: Optional[str]) -> Dict[str, Any]:
        """List files in directory."""
        path = args[0] if args else (project_path or "/tmp")
        
        try:
            files = self.file_service.list_files(path, include_hidden=False)
            
            return {
                "path": path,
                "files": [
                    {
                        "name": f.name,
                        "type": f.type,
                        "size": f.size,
                    }
                    for f in files[:20]  # Limit to 20 for display
                ],
                "total": len(files),
                "message": f"Found {len(files)} items in {path}",
            }
            
        except Exception as e:
            return {
                "error": str(e),
                "path": path,
            }

    async def _git_command(self, args: list[str], session_id: str, project_path: Optional[str]) -> Dict[str, Any]:
        """Show git information."""
        if not project_path:
            return {"error": "No project path set"}
        
        subcommand = args[0] if args else "status"
        
        try:
            if subcommand == "status":
                status = self.git_service.get_status(project_path)
                return {
                    "subcommand": "status",
                    "data": status,
                    "message": f"Branch: {status['current_branch']}, Modified: {len(status['modified'])}, Untracked: {len(status['untracked'])}",
                }
                
            elif subcommand == "log":
                log = self.git_service.get_log(project_path, max_count=5)
                return {
                    "subcommand": "log",
                    "data": log,
                    "message": f"Last {len(log)} commits",
                }
                
            elif subcommand == "branches":
                branches = self.git_service.get_branches(project_path)
                current = [b for b in branches if b["is_current"]]
                return {
                    "subcommand": "branches",
                    "data": branches,
                    "message": f"Current: {current[0]['name'] if current else 'unknown'}, Total: {len(branches)}",
                }
                
            else:
                return {
                    "error": f"Unknown git subcommand: {subcommand}",
                    "available": ["status", "log", "branches"],
                }
                
        except Exception as e:
            return {
                "error": str(e),
                "subcommand": subcommand,
            }
