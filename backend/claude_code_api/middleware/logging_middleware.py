"""Request/response logging middleware."""

import time
import uuid
from fastapi import Request
import structlog

logger = structlog.get_logger()


async def logging_middleware(request: Request, call_next):
    """
    Log all requests and responses with timing.

    Adds request_id for tracing.
    """
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()

    # Log request
    logger.info(
        "Request started",
        request_id=request_id,
        method=request.method,
        path=request.url.path,
        client=request.client.host if request.client else "unknown",
    )

    # Add request_id to request state
    request.state.request_id = request_id

    try:
        response = await call_next(request)

        # Calculate duration
        duration_ms = int((time.time() - start_time) * 1000)

        # Log response
        logger.info(
            "Request completed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )

        # Add headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        return response

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)

        logger.error(
            "Request failed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            error=str(e),
            duration_ms=duration_ms,
        )

        raise
