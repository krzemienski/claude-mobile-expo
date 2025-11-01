"""Caching service for expensive operations."""

import json
import hashlib
from datetime import datetime, timedelta
from typing import Any, Optional, Dict
import structlog

logger = structlog.get_logger()


class CacheService:
    """In-memory cache for expensive operations."""

    def __init__(self, default_ttl_seconds: int = 300):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl_seconds

    def _generate_key(self, namespace: str, params: Any) -> str:
        """Generate cache key from namespace and parameters."""
        params_str = json.dumps(params, sort_keys=True)
        hash_obj = hashlib.md5(f"{namespace}:{params_str}".encode())
        return hash_obj.hexdigest()

    def get(self, namespace: str, params: Any) -> Optional[Any]:
        """Get cached value if exists and not expired."""
        key = self._generate_key(namespace, params)

        if key not in self.cache:
            return None

        entry = self.cache[key]
        expires_at = entry["expires_at"]

        if datetime.utcnow() > expires_at:
            # Expired
            del self.cache[key]
            logger.debug("Cache expired", namespace=namespace, key=key)
            return None

        logger.debug("Cache hit", namespace=namespace, key=key)
        return entry["value"]

    def set(
        self,
        namespace: str,
        params: Any,
        value: Any,
        ttl_seconds: Optional[int] = None
    ):
        """Store value in cache with TTL."""
        key = self._generate_key(namespace, params)
        ttl = ttl_seconds or self.default_ttl

        self.cache[key] = {
            "value": value,
            "expires_at": datetime.utcnow() + timedelta(seconds=ttl),
            "created_at": datetime.utcnow(),
        }

        logger.debug("Cache set", namespace=namespace, key=key, ttl=ttl)

    def invalidate(self, namespace: str, params: Any):
        """Invalidate specific cache entry."""
        key = self._generate_key(namespace, params)
        if key in self.cache:
            del self.cache[key]
            logger.debug("Cache invalidated", namespace=namespace, key=key)

    def invalidate_namespace(self, namespace: str):
        """Invalidate all entries in namespace."""
        keys_to_delete = [
            key for key in self.cache.keys()
            if key.startswith(namespace)
        ]

        for key in keys_to_delete:
            del self.cache[key]

        logger.info("Cache namespace invalidated", namespace=namespace, count=len(keys_to_delete))

    def clear_all(self):
        """Clear entire cache."""
        count = len(self.cache)
        self.cache.clear()
        logger.info("Cache cleared", entries_removed=count)

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_entries = len(self.cache)
        expired = sum(
            1 for entry in self.cache.values()
            if datetime.utcnow() > entry["expires_at"]
        )

        return {
            "total_entries": total_entries,
            "expired_entries": expired,
            "active_entries": total_entries - expired,
        }


# Global cache instance
cache_service = CacheService(default_ttl_seconds=300)  # 5 minutes default
