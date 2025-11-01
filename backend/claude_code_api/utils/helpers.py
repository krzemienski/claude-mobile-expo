"""General helper utilities."""

import hashlib
import secrets
from typing import Optional, List, Any
from datetime import datetime, timedelta


def generate_id(prefix: str = "") -> str:
    """Generate unique ID with optional prefix."""
    unique_part = secrets.token_hex(16)
    return f"{prefix}{unique_part}" if prefix else unique_part


def hash_string(text: str, algorithm: str = "sha256") -> str:
    """Hash string with specified algorithm."""
    if algorithm == "md5":
        return hashlib.md5(text.encode()).hexdigest()
    elif algorithm == "sha256":
        return hashlib.sha256(text.encode()).hexdigest()
    elif algorithm == "sha512":
        return hashlib.sha512(text.encode()).hexdigest()
    else:
        raise ValueError(f"Unsupported algorithm: {algorithm}")


def chunk_list(items: List[Any], chunk_size: int) -> List[List[Any]]:
    """Split list into chunks."""
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


def deduplicate(items: List[Any], key: Optional[callable] = None) -> List[Any]:
    """Remove duplicates from list, preserving order."""
    seen = set()
    result = []

    for item in items:
        k = key(item) if key else item
        if k not in seen:
            seen.add(k)
            result.append(item)

    return result


def merge_dicts(*dicts: dict) -> dict:
    """Merge multiple dictionaries, later values override earlier."""
    result = {}
    for d in dicts:
        result.update(d)
    return result


def is_expired(timestamp: datetime, ttl_seconds: int) -> bool:
    """Check if timestamp is expired given TTL."""
    age = datetime.utcnow() - timestamp
    return age.total_seconds() > ttl_seconds


def time_ago(dt: datetime) -> str:
    """Format datetime as relative time."""
    now = datetime.utcnow()
    diff = now - dt

    seconds = diff.total_seconds()

    if seconds < 60:
        return "just now"
    elif seconds < 3600:
        mins = int(seconds / 60)
        return f"{mins}m ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours}h ago"
    else:
        days = int(seconds / 86400)
        return f"{days}d ago"
