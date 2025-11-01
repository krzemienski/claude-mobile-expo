"""System Prompt Management Service."""

import json
from pathlib import Path
from typing import List, Optional
import structlog

from claude_code_api.core.database import db_manager, AsyncSessionLocal, Session
from sqlalchemy import update

logger = structlog.get_logger()


class PromptManagerService:
    """Manages system prompts for sessions."""

    def __init__(self):
        self.templates_path = Path(__file__).parent.parent / "data" / "prompt_templates.json"

    async def get_system_prompt(self, session_id: str) -> Optional[str]:
        """Get current system prompt for session."""
        session = await db_manager.get_session(session_id)
        return session.system_prompt if session else None

    async def set_system_prompt(self, session_id: str, content: str) -> bool:
        """Set/replace system prompt for session."""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                update(Session)
                .where(Session.id == session_id)
                .values(system_prompt=content)
            )
            await session.commit()

            logger.info("System prompt set", session_id=session_id, length=len(content))
            return result.rowcount > 0

    async def append_system_prompt(self, session_id: str, addition: str) -> bool:
        """Append to existing system prompt."""
        current = await self.get_system_prompt(session_id)
        new_prompt = (current or "") + "\n\n" + addition

        return await self.set_system_prompt(session_id, new_prompt)

    def list_prompt_templates(self) -> List[dict]:
        """Get predefined prompt templates."""
        if not self.templates_path.exists():
            # Return default templates
            return self._get_default_templates()

        try:
            data = json.loads(self.templates_path.read_text())
            return data
        except Exception as e:
            logger.error("Failed to load templates", error=str(e))
            return self._get_default_templates()

    def _get_default_templates(self) -> List[dict]:
        """Default prompt templates."""
        return [
            {
                "name": "Coding Assistant",
                "content": "You are an expert coding assistant. Help with code review, debugging, and implementation. Follow best practices and write clean, maintainable code.",
                "category": "development"
            },
            {
                "name": "Code Reviewer",
                "content": "You are a thorough code reviewer. Focus on finding bugs, security issues, performance problems, and suggesting improvements. Be specific and actionable in your feedback.",
                "category": "quality"
            },
            {
                "name": "Bug Fixer",
                "content": "You are a debugging expert. Systematically investigate issues, identify root causes, and provide targeted fixes. Always verify the fix resolves the issue.",
                "category": "debugging"
            },
            {
                "name": "Documentation Writer",
                "content": "You are a technical documentation specialist. Write clear, comprehensive documentation with examples. Focus on helping users understand concepts and APIs.",
                "category": "documentation"
            },
            {
                "name": "Test Writer",
                "content": "You are a testing expert. Write comprehensive test suites covering edge cases, error conditions, and happy paths. Follow TDD principles.",
                "category": "testing"
            },
            {
                "name": "Security Auditor",
                "content": "You are a security auditor. Review code for vulnerabilities, authentication issues, data exposure, and security best practices. Be thorough and specific.",
                "category": "security"
            },
        ]

    def load_claudemd_as_prompt(self, project_path: str) -> Optional[str]:
        """Load CLAUDE.md from project as system prompt context."""
        claudemd_path = Path(project_path) / "CLAUDE.md"

        if not claudemd_path.exists():
            return None

        try:
            content = claudemd_path.read_text()
            logger.info("CLAUDE.md loaded", project=project_path, length=len(content))
            return content
        except Exception as e:
            logger.error("Failed to load CLAUDE.md", error=str(e))
            return None
