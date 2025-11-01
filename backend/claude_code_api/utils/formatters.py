"""Response formatting utilities."""

from datetime import datetime
from typing import Any, Dict, List


def format_file_size(bytes: int) -> str:
    """Format bytes as human-readable size."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes < 1024:
            return f"{bytes:.1f}{unit}"
        bytes /= 1024
    return f"{bytes:.1f}TB"


def format_timestamp(dt: datetime) -> str:
    """Format datetime as ISO string."""
    return dt.isoformat() + "Z"


def format_duration(seconds: float) -> str:
    """Format duration in human-readable form."""
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        return f"{seconds/60:.1f}m"
    elif seconds < 86400:
        return f"{seconds/3600:.1f}h"
    else:
        return f"{seconds/86400:.1f}d"


def format_cost(cost_usd: float) -> str:
    """Format cost in USD."""
    if cost_usd < 0.01:
        return f"${cost_usd*1000:.2f}m"  # In mills
    else:
        return f"${cost_usd:.4f}"


def paginate_results(
    items: List[Any],
    page: int,
    per_page: int
) -> Dict[str, Any]:
    """
    Paginate list of items.

    Returns dict with data and pagination info.
    """
    total = len(items)
    total_pages = (total + per_page - 1) // per_page

    start = (page - 1) * per_page
    end = start + per_page

    return {
        "data": items[start:end],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total_items": total,
            "total_pages": total_pages,
            "has_next": end < total,
            "has_prev": page > 1,
        }
    }


def truncate_string(text: str, max_length: int, suffix: str = "...") -> str:
    """Truncate string to max length."""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def format_error_response(
    message: str,
    error_type: str = "error",
    code: str = "error",
    details: Any = None
) -> Dict[str, Any]:
    """Format error in OpenAI-compatible structure."""
    error = {
        "message": message,
        "type": error_type,
        "code": code,
    }

    if details:
        error["details"] = details

    return {"error": error}
