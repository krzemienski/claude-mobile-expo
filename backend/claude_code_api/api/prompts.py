"""System Prompt Management API."""

from typing import List
from fastapi import APIRouter, HTTPException, status, Body
from pydantic import BaseModel, Field
import structlog

from claude_code_api.services.prompt_manager import PromptManagerService

logger = structlog.get_logger()
router = APIRouter()

prompt_service = PromptManagerService()


class SetPromptRequest(BaseModel):
    """Set system prompt request."""
    content: str = Field(..., description="System prompt content")


class AppendPromptRequest(BaseModel):
    """Append to system prompt request."""
    addition: str = Field(..., description="Text to append")


class LoadClaudeMDRequest(BaseModel):
    """Load CLAUDE.md request."""
    project_path: str = Field(..., description="Project directory path")


@router.get("/prompts/system/{session_id}")
async def get_system_prompt(session_id: str) -> dict:
    """Get current system prompt for session."""
    try:
        prompt = await prompt_service.get_system_prompt(session_id)
        return {"session_id": session_id, "system_prompt": prompt}
    except Exception as e:
        logger.error("get system prompt error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/prompts/system/{session_id}")
async def set_system_prompt(session_id: str, request: SetPromptRequest) -> dict:
    """Set/replace system prompt for session."""
    try:
        success = await prompt_service.set_system_prompt(session_id, request.content)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found")
        return {"success": True, "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("set system prompt error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/prompts/append/{session_id}")
async def append_system_prompt(session_id: str, request: AppendPromptRequest) -> dict:
    """Append to existing system prompt."""
    try:
        success = await prompt_service.append_system_prompt(session_id, request.addition)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found")
        return {"success": True, "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("append system prompt error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/prompts/templates")
async def list_templates() -> List[dict]:
    """List available prompt templates."""
    try:
        return prompt_service.list_prompt_templates()
    except Exception as e:
        logger.error("list templates error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/prompts/load-claudemd")
async def load_claudemd(request: LoadClaudeMDRequest) -> dict:
    """Load CLAUDE.md as system prompt context."""
    try:
        content = prompt_service.load_claudemd_as_prompt(request.project_path)
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"CLAUDE.md not found in {request.project_path}"
            )
        return {"success": True, "content": content, "length": len(content)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("load CLAUDE.md error", error=str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
