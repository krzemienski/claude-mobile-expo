"""Webhooks API - For future real-time notifications."""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, HttpUrl
import structlog

logger = structlog.get_logger()
router = APIRouter()


class WebhookConfig(BaseModel):
    """Webhook configuration."""
    url: HttpUrl = Field(..., description="Webhook URL")
    events: List[str] = Field(..., description="Events to subscribe to")
    secret: Optional[str] = Field(None, description="Webhook secret for signatures")


class WebhookResponse(BaseModel):
    """Webhook response."""
    id: str
    url: str
    events: List[str]
    active: bool


import uuid
import httpx
from typing import Dict

# In-memory webhook storage (would use database in production)
webhooks: Dict[str, WebhookConfig] = {}


@router.post("/webhooks")
async def create_webhook(config: WebhookConfig) -> WebhookResponse:
    """
    Register webhook for events.

    Events: session.created, session.ended, message.sent, tool.executed, etc.
    """
    webhook_id = str(uuid.uuid4())
    webhooks[webhook_id] = config

    logger.info("Webhook created", id=webhook_id, url=str(config.url))

    return WebhookResponse(
        id=webhook_id,
        url=str(config.url),
        events=config.events,
        active=True,
    )


@router.get("/webhooks")
async def list_webhooks() -> List[WebhookResponse]:
    """List all registered webhooks."""
    return [
        WebhookResponse(
            id=wid,
            url=str(config.url),
            events=config.events,
            active=True,
        )
        for wid, config in webhooks.items()
    ]


@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(webhook_id: str) -> dict:
    """Delete webhook."""
    if webhook_id in webhooks:
        del webhooks[webhook_id]
        return {"success": True}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook not found")


# Import uuid
import uuid
from typing import Dict
