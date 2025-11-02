"""Response caching middleware for expensive GET operations."""

import hashlib
from fastapi import Request
from fastapi.responses import Response, JSONResponse
import structlog

from claude_code_api.services.cache_service import cache_service

logger = structlog.get_logger()

# Cacheable endpoints (GET only)
CACHEABLE_PATHS = [
    "/v1/files/list",
    "/v1/files/read",
    "/v1/files/info",
    "/v1/files/search",
    "/v1/git/status",
    "/v1/git/log",
    "/v1/git/diff",
    "/v1/git/branches",
    "/v1/git/remotes",
    "/v1/mcp/servers",
    "/v1/skills",
    "/v1/agents",
    "/v1/prompts/templates",
    "/v1/host/discover-projects",
    "/v1/host/browse",
    "/v1/stats/global",
    "/v1/stats/project",
    "/v1/models",
]


def is_cacheable(request: Request) -> bool:
    """Check if request should be cached."""
    # Only cache GET requests
    if request.method != "GET":
        return False
    
    # Check if path is in cacheable list
    path = request.url.path
    return any(path.startswith(cacheable) for cacheable in CACHEABLE_PATHS)


def generate_cache_key(request: Request) -> str:
    """Generate cache key from request."""
    # Combine path + query params for unique key
    key_str = f"{request.url.path}?{request.url.query}"
    return hashlib.md5(key_str.encode()).hexdigest()


async def cache_middleware(request: Request, call_next):
    """
    Caching middleware for GET requests.
    
    TTL:
    - File operations: 30 seconds
    - Git operations: 10 seconds  
    - Discovery/Browse: 60 seconds
    - Skills/Agents: 120 seconds (rarely change)
    - Stats: 30 seconds
    """
    # Skip if not cacheable
    if not is_cacheable(request):
        return await call_next(request)
    
    # Generate cache key
    cache_key = generate_cache_key(request)
    namespace = request.url.path.split("/")[1:3]  # e.g., ["v1", "files"]
    namespace_str = "-".join(namespace)
    
    # Check cache
    cached_response = cache_service.get(namespace_str, cache_key)
    
    if cached_response:
        logger.debug(
            "Cache hit",
            path=request.url.path,
            cache_key=cache_key[:8]
        )
        
        # Return cached response
        return JSONResponse(
            content=cached_response["content"],
            status_code=cached_response.get("status_code", 200),
            headers={
                "X-Cache": "HIT",
                "X-Cache-Key": cache_key[:8],
            }
        )
    
    # Cache miss - process request
    response = await call_next(request)
    
    # Cache successful GET responses
    if response.status_code == 200 and request.method == "GET":
        # Determine TTL based on endpoint
        ttl = 30  # Default: 30 seconds
        
        if "git" in request.url.path:
            ttl = 10  # Git changes frequently
        elif "discover" in request.url.path or "browse" in request.url.path:
            ttl = 60  # Filesystem changes less often
        elif "skills" in request.url.path or "agents" in request.url.path:
            ttl = 120  # Skills/agents rarely change
        elif "stats" in request.url.path:
            ttl = 30  # Stats update moderately
        
        # Extract response body
        # Note: This requires reading the response body which consumes it
        # In production, would use StreamingResponse wrapper
        
        # For now, just add cache header without storing
        response.headers["X-Cache"] = "MISS"
        response.headers["X-Cache-TTL"] = str(ttl)
        
        logger.debug(
            "Cache miss",
            path=request.url.path,
            cache_key=cache_key[:8],
            ttl=ttl
        )
    
    return response


def invalidate_cache_for_writes(request: Request):
    """
    Invalidate cache when write operations occur.
    
    Example: After POST /v1/files/write, invalidate /v1/files/* cache.
    """
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        path = request.url.path
        
        # Determine namespace to invalidate
        if "/files/" in path:
            cache_service.invalidate_namespace("v1-files")
            logger.info("Cache invalidated", namespace="v1-files", reason="write operation")
        elif "/git/" in path:
            cache_service.invalidate_namespace("v1-git")
            logger.info("Cache invalidated", namespace="v1-git", reason="git operation")
        elif "/skills" in path:
            cache_service.invalidate_namespace("v1-skills")
        elif "/agents" in path:
            cache_service.invalidate_namespace("v1-agents")
        elif "/mcp/" in path:
            cache_service.invalidate_namespace("v1-mcp")
