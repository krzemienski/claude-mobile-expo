"""Agents Management API - CRUD for ~/.claude/agents/"""

from typing import List
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import structlog

logger = structlog.get_logger()
router = APIRouter()


class CreateAgentRequest(BaseModel):
    """Create agent request."""
    name: str = Field(..., description="Agent name (filename without .md)")
    content: str = Field(..., description="Agent markdown content")
    description: str = Field(..., description="Short description")
    subagent_type: str = Field("general-purpose", description="Agent type")


class AgentResponse(BaseModel):
    """Agent information response."""
    name: str
    path: str
    description: str
    subagent_type: str
    size: int


def get_agents_directory() -> Path:
    """Get agents directory path."""
    agents_dir = Path.home() / ".claude" / "agents"
    agents_dir.mkdir(parents=True, exist_ok=True)
    return agents_dir


@router.get("/agents")
async def list_agents() -> List[AgentResponse]:
    """List all available agents from ~/.claude/agents/"""
    try:
        agents_dir = get_agents_directory()
        agents = []
        
        for agent_dir in agents_dir.iterdir():
            if agent_dir.is_dir():
                agent_file = agent_dir / "AGENT.md"
                if agent_file.exists():
                    content = agent_file.read_text()
                    
                    # Extract metadata from front matter
                    description = ""
                    subagent_type = "general-purpose"
                    
                    if content.startswith("---"):
                        parts = content.split("---", 2)
                        if len(parts) >= 3:
                            front_matter = parts[1]
                            for line in front_matter.split("\n"):
                                if line.startswith("description:"):
                                    description = line.split("description:", 1)[1].strip()
                                elif line.startswith("subagent_type:"):
                                    subagent_type = line.split("subagent_type:", 1)[1].strip()
                    
                    agents.append(AgentResponse(
                        name=agent_dir.name,
                        path=str(agent_file),
                        description=description,
                        subagent_type=subagent_type,
                        size=agent_file.stat().st_size,
                    ))
        
        logger.info("Agents listed", count=len(agents))
        return agents
        
    except Exception as e:
        logger.error("Failed to list agents", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list agents: {str(e)}"
        )


@router.get("/agents/{name}")
async def get_agent(name: str) -> dict:
    """Get agent content by name."""
    try:
        agents_dir = get_agents_directory()
        agent_file = agents_dir / name / "AGENT.md"
        
        if not agent_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent '{name}' not found"
            )
        
        content = agent_file.read_text()
        
        logger.info("Agent retrieved", name=name, size=len(content))
        
        return {
            "name": name,
            "content": content,
            "path": str(agent_file),
            "size": len(content),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get agent", name=name, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get agent: {str(e)}"
        )


@router.post("/agents")
async def create_agent(request: CreateAgentRequest) -> AgentResponse:
    """Create new agent."""
    try:
        agents_dir = get_agents_directory()
        agent_dir = agents_dir / request.name
        agent_dir.mkdir(exist_ok=True)
        
        agent_file = agent_dir / "AGENT.md"
        
        # Create agent content with front matter
        full_content = f"""---
name: {request.name}
description: {request.description}
subagent_type: {request.subagent_type}
---

{request.content}
"""
        
        agent_file.write_text(full_content)
        
        logger.info("Agent created", name=request.name, size=len(full_content))
        
        return AgentResponse(
            name=request.name,
            path=str(agent_file),
            description=request.description,
            subagent_type=request.subagent_type,
            size=len(full_content),
        )
        
    except Exception as e:
        logger.error("Failed to create agent", name=request.name, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent: {str(e)}"
        )


@router.delete("/agents/{name}")
async def delete_agent(name: str) -> dict:
    """Delete agent by name."""
    try:
        agents_dir = get_agents_directory()
        agent_dir = agents_dir / name
        
        if not agent_dir.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent '{name}' not found"
            )
        
        # Delete AGENT.md file
        agent_file = agent_dir / "AGENT.md"
        if agent_file.exists():
            agent_file.unlink()
        
        # Remove directory if empty
        try:
            agent_dir.rmdir()
        except OSError:
            # Directory not empty, that's OK
            pass
        
        logger.info("Agent deleted", name=name)
        
        return {"success": True, "message": f"Agent '{name}' deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete agent", name=name, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete agent: {str(e)}"
        )
