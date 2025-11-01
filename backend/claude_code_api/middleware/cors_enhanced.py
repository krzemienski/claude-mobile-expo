"""Enhanced CORS middleware with dynamic origin support."""

from fastapi import Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware as BaseCORSMiddleware
from typing import List
import structlog

logger = structlog.get_logger()


def is_origin_allowed(origin: str, allowed_patterns: List[str]) -> bool:
    """
    Check if origin matches any allowed pattern.

    Supports:
    - Exact match: "https://example.com"
    - Wildcard subdomain: "https://*.example.com"
    - Localhost with any port: "http://localhost:*"
    """
    if "*" in allowed_patterns:
        return True

    if origin in allowed_patterns:
        return True

    # Check patterns
    for pattern in allowed_patterns:
        if "*" in pattern:
            # Simple wildcard matching
            pattern_parts = pattern.split("*")
            if len(pattern_parts) == 2:
                prefix, suffix = pattern_parts
                if origin.startswith(prefix) and origin.endswith(suffix):
                    return True

    return False


class DynamicCORSMiddleware:
    """
    CORS middleware with dynamic origin validation.

    Logs CORS decisions for security auditing.
    """

    def __init__(self, app, allowed_patterns: List[str]):
        self.app = app
        self.allowed_patterns = allowed_patterns

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = dict(scope["headers"])
        origin = headers.get(b"origin")

        if origin:
            origin_str = origin.decode()

            if is_origin_allowed(origin_str, self.allowed_patterns):
                logger.debug("CORS allowed", origin=origin_str)
                # Add CORS headers
                async def send_with_cors(message):
                    if message["type"] == "http.response.start":
                        message.setdefault("headers", [])
                        message["headers"].append((b"access-control-allow-origin", origin))
                        message["headers"].append((b"access-control-allow-credentials", b"true"))
                    await send(message)

                await self.app(scope, receive, send_with_cors)
            else:
                logger.warning("CORS blocked", origin=origin_str)
                await self.app(scope, receive, send)
        else:
            await self.app(scope, receive, send)
