# Claude Code Mobile Backend - Deployment Guide

## Quick Start (Development)

```bash
cd backend
pip install -e .
python -m uvicorn claude_code_api.main:app --host 0.0.0.0 --port 8001 --reload
```

Backend runs on: http://localhost:8001

## Production Deployment

### Environment Variables

Create `.env` file:
```bash
# Server
PORT=8001
HOST=0.0.0.0

# Authentication (optional)
REQUIRE_AUTH=false
API_KEYS=key1,key2,key3

# Claude
CLAUDE_BINARY_PATH=/path/to/claude

# Database
DATABASE_URL=sqlite:///./claude_api.db

# MCP Encryption
MCP_ENCRYPTION_KEY=<generated-key>

# CORS
ALLOWED_ORIGINS=*
```

### Docker Deployment

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY backend/ /app/
RUN pip install -e .

EXPOSE 8001
CMD ["uvicorn", "claude_code_api.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

Build and run:
```bash
docker build -t claude-mobile-backend .
docker run -p 8001:8001 claude-mobile-backend
```

### Cloud Platforms

**Railway/Render/Fly.io**:
```bash
# Install dependencies
pip install -e .

# Start command
uvicorn claude_code_api.main:app --host 0.0.0.0 --port $PORT
```

**AWS Lambda** (with Mangum):
```python
from mangum import Mangum
from claude_code_api.main import app

handler = Mangum(app)
```

## Validation

After deployment, run validation:
```bash
./backend/validate-all-gates.sh
```

Should show: `✅ ALL GATES PASSED (40/40)`

## Monitoring

Health check: `GET /health`

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "claude_version": "2.0.31",
  "active_sessions": 0
}
```

## Security

**For Production**:
1. Set `REQUIRE_AUTH=true`
2. Configure `API_KEYS`
3. Restrict `ALLOWED_ORIGINS`
4. Use HTTPS
5. Set secure `MCP_ENCRYPTION_KEY`

**File Operations Security**:
- Configure `allowed_paths` in file_service
- Default: `/Users`, `/tmp`, `/var`
- Restricts to prevent unauthorized file access

## Database

**Development**: SQLite (default)
**Production**: PostgreSQL recommended

Update `DATABASE_URL`:
```
postgresql+asyncpg://user:pass@host:5432/dbname
```

## Performance

**Caching**: 5-minute TTL for expensive operations
**Rate Limiting**: 100 req/min, burst 10
**Concurrent Sessions**: Max 10 (configurable)

## Troubleshooting

**Claude CLI not found**:
- Set `CLAUDE_BINARY_PATH` in .env
- Or ensure `claude` in PATH

**Port already in use**:
- Change `PORT` in .env
- Or kill existing process: `pkill -f uvicorn`

**Database locked**:
- SQLite: Close other connections
- Or switch to PostgreSQL for production
