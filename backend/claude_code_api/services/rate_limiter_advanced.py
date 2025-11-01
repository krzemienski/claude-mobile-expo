"""Advanced rate limiting with sliding window algorithm."""

import time
from collections import deque
from typing import Dict, Tuple
import structlog

logger = structlog.get_logger()


class SlidingWindowRateLimiter:
    """
    Sliding window rate limiter.

    More accurate than fixed window, prevents burst at window boundaries.
    """

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, deque] = {}

    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """
        Check if request is allowed.

        Returns: (allowed, remaining_quota)
        """
        now = time.time()

        # Initialize client queue if needed
        if client_id not in self.requests:
            self.requests[client_id] = deque()

        request_queue = self.requests[client_id]

        # Remove requests outside the window
        cutoff_time = now - self.window_seconds
        while request_queue and request_queue[0] < cutoff_time:
            request_queue.popleft()

        # Check if under limit
        current_count = len(request_queue)

        if current_count >= self.max_requests:
            # Rate limit exceeded
            oldest_request = request_queue[0]
            retry_after = int(oldest_request + self.window_seconds - now)
            logger.warning(
                "Rate limit exceeded",
                client_id=client_id,
                current_count=current_count,
                max=self.max_requests,
                retry_after=retry_after
            )
            return False, 0

        # Allow request
        request_queue.append(now)
        remaining = self.max_requests - current_count - 1

        return True, remaining

    def reset(self, client_id: str):
        """Reset rate limit for client."""
        if client_id in self.requests:
            del self.requests[client_id]

    def get_stats(self) -> Dict:
        """Get rate limiter statistics."""
        now = time.time()
        active_clients = 0
        total_requests = 0

        for client_id, request_queue in self.requests.items():
            # Count only requests in current window
            cutoff = now - self.window_seconds
            recent = sum(1 for req_time in request_queue if req_time > cutoff)

            if recent > 0:
                active_clients += 1
                total_requests += recent

        return {
            "active_clients": active_clients,
            "total_tracked_clients": len(self.requests),
            "total_recent_requests": total_requests,
            "window_seconds": self.window_seconds,
            "max_per_window": self.max_requests,
        }


class TokenBucketRateLimiter:
    """
    Token bucket rate limiter.

    Allows controlled bursts while maintaining average rate.
    """

    def __init__(self, capacity: int, refill_rate: float):
        """
        Args:
            capacity: Max tokens in bucket
            refill_rate: Tokens per second to add
        """
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.buckets: Dict[str, Dict] = {}

    def is_allowed(self, client_id: str, tokens: int = 1) -> Tuple[bool, float]:
        """
        Check if request is allowed and consume tokens.

        Returns: (allowed, tokens_remaining)
        """
        now = time.time()

        if client_id not in self.buckets:
            self.buckets[client_id] = {
                "tokens": self.capacity,
                "last_update": now,
            }

        bucket = self.buckets[client_id]

        # Refill tokens based on time elapsed
        elapsed = now - bucket["last_update"]
        bucket["tokens"] = min(
            self.capacity,
            bucket["tokens"] + (elapsed * self.refill_rate)
        )
        bucket["last_update"] = now

        # Check if enough tokens
        if bucket["tokens"] >= tokens:
            bucket["tokens"] -= tokens
            return True, bucket["tokens"]
        else:
            return False, bucket["tokens"]
