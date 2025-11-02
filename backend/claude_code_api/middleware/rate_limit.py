"""Rate limiting middleware using sliding window algorithm."""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import structlog

from claude_code_api.services.rate_limiter_advanced import SlidingWindowRateLimiter

logger = structlog.get_logger()

# Global rate limiter: 100 requests per 60 seconds per client
rate_limiter = SlidingWindowRateLimiter(max_requests=100, window_seconds=60)


async def rate_limit_middleware(request: Request, call_next):
    """
    Rate limiting middleware.
    
    Limits: 100 requests per 60 seconds per client IP.
    Returns 429 Too Many Requests when exceeded.
    """
    # Get client identifier (IP address)
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    is_allowed, remaining = rate_limiter.is_allowed(client_ip)
    
    if not is_allowed:
        logger.warning(
            "Rate limit exceeded",
            client_ip=client_ip,
            path=request.url.path,
            method=request.method
        )
        
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": {
                    "message": "Rate limit exceeded. Please try again later.",
                    "type": "rate_limit_error",
                    "code": "rate_limit_exceeded"
                }
            },
            headers={
                "Retry-After": "60",
                "X-RateLimit-Limit": "100",
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(time.time()) + 60)
            }
        )
    
    # Process request
    response = await call_next(request)
    
    # Add rate limit headers
    response.headers["X-RateLimit-Limit"] = "100"
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Window"] = "60"
    
    logger.debug(
        "Rate limit check",
        client_ip=client_ip,
        remaining=remaining,
        path=request.url.path
    )
    
    return response


async def get_rate_limit_stats(request: Request) -> dict:
    """Get rate limiter statistics (for admin endpoint)."""
    stats = rate_limiter.get_stats()
    return {
        "rate_limiter": {
            "algorithm": "sliding_window",
            "max_requests": 100,
            "window_seconds": 60,
            **stats
        }
    }
