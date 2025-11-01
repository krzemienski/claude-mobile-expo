"""Text processing utilities."""

import re
from typing import List


def extract_code_blocks(text: str) -> List[dict]:
    """Extract code blocks from markdown."""
    pattern = r'```(\w+)?\n(.*?)```'
    matches = re.findall(pattern, text, re.DOTALL)

    return [
        {
            "language": lang or "text",
            "code": code.strip()
        }
        for lang, code in matches
    ]


def count_tokens_estimate(text: str) -> int:
    """Rough token count estimation (4 chars per token)."""
    return max(1, len(text) // 4)


def truncate_to_tokens(text: str, max_tokens: int) -> str:
    """Truncate text to approximate token count."""
    max_chars = max_tokens * 4
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "..."


def extract_urls(text: str) -> List[str]:
    """Extract URLs from text."""
    url_pattern = r'https?://[^\s<>"]+'
    return re.findall(url_pattern, text)


def strip_markdown(text: str) -> str:
    """Remove markdown formatting."""
    # Remove code blocks
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    # Remove inline code
    text = re.sub(r'`[^`]+`', '', text)
    # Remove bold/italic
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    # Remove links
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Remove headers
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)

    return text.strip()


def highlight_search_terms(text: str, terms: List[str], tag: str = "mark") -> str:
    """Highlight search terms in text."""
    for term in terms:
        pattern = re.compile(re.escape(term), re.IGNORECASE)
        text = pattern.sub(f'<{tag}>\\g<0></{tag}>', text)

    return text
