FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml setup.py ./
COPY claude_code_api/__init__.py ./claude_code_api/

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Copy application code
COPY claude_code_api/ ./claude_code_api/

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8001/health')"

# Run application
CMD ["uvicorn", "claude_code_api.main:app", "--host", "0.0.0.0", "--port", "8001"]
