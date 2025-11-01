"""File system utilities."""

import mimetypes
from pathlib import Path
from typing import Optional


def get_mime_type(path: str) -> str:
    """Get MIME type from file extension."""
    mime_type, _ = mimetypes.guess_type(path)
    return mime_type or "application/octet-stream"


def get_file_category(path: str) -> str:
    """Categorize file by extension."""
    ext = Path(path).suffix.lower()

    categories = {
        "code": [".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".cpp", ".c", ".h", ".go", ".rs", ".swift", ".kt"],
        "web": [".html", ".css", ".scss", ".less"],
        "data": [".json", ".yaml", ".yml", ".xml", ".csv", ".toml"],
        "doc": [".md", ".txt", ".pdf", ".docx"],
        "image": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"],
        "config": [".env", ".config", ".ini", ".conf"],
    }

    for category, extensions in categories.items():
        if ext in extensions:
            return category

    return "other"


def is_text_file(path: str) -> bool:
    """Check if file is likely text-based."""
    text_extensions = {
        ".txt", ".md", ".py", ".js", ".ts", ".tsx", ".jsx",
        ".json", ".yaml", ".yml", ".xml", ".html", ".css",
        ".sh", ".bash", ".zsh", ".fish", ".conf", ".config",
        ".env", ".gitignore", ".sql", ".log"
    }

    ext = Path(path).suffix.lower()
    return ext in text_extensions


def is_binary_file(path: str) -> bool:
    """Check if file is binary."""
    binary_extensions = {
        ".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip",
        ".tar", ".gz", ".exe", ".dll", ".so", ".dylib",
        ".mp4", ".mp3", ".wav"
    }

    ext = Path(path).suffix.lower()
    return ext in binary_extensions


def get_language_from_extension(path: str) -> str:
    """Get programming language from file extension."""
    ext = Path(path).suffix.lower()

    lang_map = {
        ".py": "python",
        ".js": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".jsx": "javascript",
        ".java": "java",
        ".cpp": "cpp",
        ".c": "c",
        ".go": "go",
        ".rs": "rust",
        ".swift": "swift",
        ".kt": "kotlin",
        ".rb": "ruby",
        ".php": "php",
        ".html": "html",
        ".css": "css",
        ".json": "json",
        ".md": "markdown",
        ".sql": "sql",
        ".sh": "bash",
    }

    return lang_map.get(ext, "text")
