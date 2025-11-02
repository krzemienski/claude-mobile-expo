"""Skills Management API - CRUD for ~/.claude/skills/"""

from typing import List
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import structlog

logger = structlog.get_logger()
router = APIRouter()


class CreateSkillRequest(BaseModel):
    """Create skill request."""
    name: str = Field(..., description="Skill name (filename without .md)")
    content: str = Field(..., description="Skill markdown content")
    description: str = Field(..., description="Short description")


class SkillResponse(BaseModel):
    """Skill information response."""
    name: str
    path: str
    description: str
    size: int


def get_skills_directory() -> Path:
    """Get skills directory path."""
    skills_dir = Path.home() / ".claude" / "skills"
    skills_dir.mkdir(parents=True, exist_ok=True)
    return skills_dir


@router.get("/skills")
async def list_skills() -> List[SkillResponse]:
    """List all available skills from ~/.claude/skills/"""
    try:
        skills_dir = get_skills_directory()
        skills = []
        
        for skill_dir in skills_dir.iterdir():
            if skill_dir.is_dir():
                skill_file = skill_dir / "SKILL.md"
                if skill_file.exists():
                    content = skill_file.read_text()
                    
                    # Extract description from front matter
                    description = ""
                    if content.startswith("---"):
                        parts = content.split("---", 2)
                        if len(parts) >= 3:
                            front_matter = parts[1]
                            for line in front_matter.split("\n"):
                                if line.startswith("description:"):
                                    description = line.split("description:", 1)[1].strip()
                    
                    skills.append(SkillResponse(
                        name=skill_dir.name,
                        path=str(skill_file),
                        description=description,
                        size=skill_file.stat().st_size,
                    ))
        
        logger.info("Skills listed", count=len(skills))
        return skills
        
    except Exception as e:
        logger.error("Failed to list skills", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list skills: {str(e)}"
        )


@router.get("/skills/{name}")
async def get_skill(name: str) -> dict:
    """Get skill content by name."""
    try:
        skills_dir = get_skills_directory()
        skill_file = skills_dir / name / "SKILL.md"
        
        if not skill_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Skill '{name}' not found"
            )
        
        content = skill_file.read_text()
        
        logger.info("Skill retrieved", name=name, size=len(content))
        
        return {
            "name": name,
            "content": content,
            "path": str(skill_file),
            "size": len(content),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get skill", name=name, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get skill: {str(e)}"
        )


@router.post("/skills")
async def create_skill(request: CreateSkillRequest) -> SkillResponse:
    """Create new skill."""
    try:
        skills_dir = get_skills_directory()
        skill_dir = skills_dir / request.name
        skill_dir.mkdir(exist_ok=True)
        
        skill_file = skill_dir / "SKILL.md"
        
        # Create skill content with front matter
        full_content = f"""---
name: {request.name}
description: {request.description}
---

{request.content}
"""
        
        skill_file.write_text(full_content)
        
        logger.info("Skill created", name=request.name, size=len(full_content))
        
        return SkillResponse(
            name=request.name,
            path=str(skill_file),
            description=request.description,
            size=len(full_content),
        )
        
    except Exception as e:
        logger.error("Failed to create skill", name=request.name, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create skill: {str(e)}"
        )


@router.delete("/skills/{name}")
async def delete_skill(name: str) -> dict:
    """Delete skill by name."""
    try:
        skills_dir = get_skills_directory()
        skill_dir = skills_dir / name
        
        if not skill_dir.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Skill '{name}' not found"
            )
        
        # Delete SKILL.md file
        skill_file = skill_dir / "SKILL.md"
        if skill_file.exists():
            skill_file.unlink()
        
        # Remove directory if empty
        try:
            skill_dir.rmdir()
        except OSError:
            # Directory not empty, that's OK
            pass
        
        logger.info("Skill deleted", name=name)
        
        return {"success": True, "message": f"Skill '{name}' deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete skill", name=name, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete skill: {str(e)}"
        )
