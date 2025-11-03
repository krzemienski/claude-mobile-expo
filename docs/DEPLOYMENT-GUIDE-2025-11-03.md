# Claude Code Mobile v2.0 - Deployment Guide

**Version**: 2.0.1
**Date**: 2025-11-03
**Status**: Backend Production Ready
**Target Platforms**: iOS (React Native), Backend (FastAPI/Python)

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring Setup](#monitoring-setup)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Development Machine

**Required**:
- Python 3.11 or higher
- Node.js 18 or higher
- Git
- Claude Code CLI v2.0.31+

**For iOS**:
- macOS (for iOS builds)
- Xcode 15+
- iOS Simulator or physical device
- CocoaPods

**Optional**:
- Docker (for containerized deployment)
- PostgreSQL (for production database)
- Redis (for distributed caching)

### Accounts & Access

- Anthropic API key (for Claude access)
- Apple Developer account (for iOS production)
- Cloud provider account (AWS/Vercel/Railway)
- Git repository access
- EAS account (for Expo Application Services)

## Backend Deployment

### Local Development

**1. Clone Repository**:
```bash
git clone https://github.com/your-org/claude-mobile-expo.git
cd claude-mobile-expo/backend
```

**2. Install Dependencies**:
```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install package in editable mode
pip install -e .
```

**3. Configure Environment**:
```bash
# Create .env file (optional - defaults work for dev)
cat > .env << EOF
# Claude
CLAUDE_BINARY_PATH=/Users/nick/.local/bin/claude
DEFAULT_MODEL=claude-3-5-haiku-20241022

# Server
HOST=0.0.0.0
PORT=8001

# Database
DATABASE_URL=sqlite:///./claude_api.db

# Auth (disabled for dev)
REQUIRE_AUTH=false
API_KEYS=

# Projects
PROJECT_ROOT=/tmp/claude_projects

# CORS
ALLOWED_ORIGINS=*
EOF
```

**4. Start Server**:
```bash
python -m uvicorn claude_code_api.main:app --host 0.0.0.0 --port 8001 --reload
```

**5. Verify**:
```bash
curl http://localhost:8001/health
# Expected: {"status":"healthy","version":"1.0.0","claude_version":"2.0.31 (Claude Code)","active_sessions":0}
```

### Docker Deployment

**1. Create Dockerfile** (backend/Dockerfile):
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY pyproject.toml setup.py ./
COPY claude_code_api/__init__.py claude_code_api/

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Copy application
COPY claude_code_api/ ./claude_code_api/

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Run application
CMD ["uvicorn", "claude_code_api.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

**2. Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    environment:
      - PORT=8001
      - DATABASE_URL=sqlite:///./data/claude_api.db
      - CLAUDE_BINARY_PATH=/usr/local/bin/claude
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./data:/app/data
      - ~/.claude:/root/.claude:ro  # Mount Claude CLI config
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Optional: PostgreSQL for production
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=claude_mobile
      - POSTGRES_USER=claude
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**3. Build and Run**:
```bash
# Build image
docker build -t claude-mobile-backend ./backend

# Run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Verify
curl http://localhost:8001/health
```

### Cloud Deployment (AWS Example)

**Option 1: AWS Elastic Beanstalk**

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p python-3.12 claude-mobile-backend

# Create environment
eb create claude-mobile-prod \
  --instance-type t3.small \
  --envvars ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# Deploy
eb deploy

# Check status
eb status
eb logs
```

**Option 2: AWS ECS (Fargate)**

```bash
# Build and push image
docker build -t claude-mobile-backend ./backend
aws ecr get-login-password | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker tag claude-mobile-backend:latest $AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/claude-mobile:latest
docker push $AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/claude-mobile:latest

# Create ECS task definition, service, etc. (use AWS Console or Terraform)
```

**Option 3: Railway / Render / Fly.io**

```bash
# Railway (simplest)
railway login
railway init
railway up
railway open

# Render
# Push to GitHub, connect repo in Render dashboard

# Fly.io
fly launch
fly deploy
```

### Production Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-xxx  # Anthropic API key
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # PostgreSQL connection
CLAUDE_BINARY_PATH=/usr/local/bin/claude  # Claude CLI location

# Security
REQUIRE_AUTH=true
API_KEYS=key1,key2,key3  # Comma-separated API keys
ALLOWED_ORIGINS=https://yourdomain.com  # CORS origins

# Optional
REDIS_URL=redis://localhost:6379  # If using Redis
SENTRY_DSN=https://xxx@sentry.io/xxx  # Error tracking
LOG_LEVEL=info  # Logging verbosity
```

## Frontend Deployment

### Local Development

**1. Clone and Install**:
```bash
cd claude-mobile-expo/claude-code-mobile
npm install
```

**2. Configure Backend URL**:
```bash
# For iOS Simulator (backend on same machine)
# Edit src/constants/config.ts or use app settings:
DEFAULT_SERVER_URL=http://localhost:8001

# For physical device (backend on network)
DEFAULT_SERVER_URL=http://192.168.x.x:8001
```

**3. Start Metro**:
```bash
# With MCP server support (for automation)
EXPO_UNSTABLE_MCP_SERVER=1 npx expo start

# Standard
npx expo start
```

**4. Run on iOS**:
```bash
# Simulator
npx expo run:ios --device "iPhone 16 Pro"

# Or press 'i' in Metro console
```

### Production Build (iOS)

**Option 1: EAS Build (Recommended)**

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Create development build
eas build --platform ios --profile development

# Create production build
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios
```

**Option 2: Local Build**

```bash
# Build for simulator (development)
npx expo run:ios --configuration Release

# Build for device (requires certificates)
# 1. Configure signing in Xcode
# 2. Open ios/claudecodemobile.xcworkspace
# 3. Select device, Product > Archive
# 4. Upload to TestFlight
```

### Expo Updates (OTA)

```bash
# Configure in app.json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
    }
  }
}

# Publish update
eas update --branch production --message "Bug fixes and improvements"

# Users get update automatically on next app restart
```

## Database Setup

### Development (SQLite)

**Automatic**: Database created on first startup

Location: `backend/claude_api.db`

**Backup**:
```bash
# Via API
curl -X POST http://localhost:8001/v1/backup/create

# Manual
cp claude_api.db claude_api.db.backup.$(date +%Y%m%d)
```

### Production (PostgreSQL)

**1. Create Database**:
```sql
CREATE DATABASE claude_mobile;
CREATE USER claude_app WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE claude_mobile TO claude_app;
```

**2. Update DATABASE_URL**:
```bash
DATABASE_URL=postgresql://claude_app:password@localhost:5432/claude_mobile
```

**3. Migration** (if migrating from SQLite):
```bash
# Export from SQLite
sqlite3 claude_api.db .dump > dump.sql

# Import to PostgreSQL (modify SQL for compatibility)
psql -U claude_app -d claude_mobile -f dump.sql
```

**4. Connection Pooling**:
```python
# In database.py, configure SQLAlchemy pool
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
```

## Environment Configuration

### Backend Configuration

**File**: `backend/claude_code_api/core/config.py`

**Settings**:
```python
class Settings(BaseSettings):
    # Claude CLI
    claude_binary_path: str = find_claude_binary()
    default_model: str = "claude-3-5-haiku-20241022"

    # Server
    host: str = "0.0.0.0"
    port: int = 8001

    # Database
    database_url: str = "sqlite:///./claude_api.db"

    # Auth
    require_auth: bool = False  # SET TO TRUE IN PRODUCTION
    api_keys: List[str] = []

    # CORS
    allowed_origins: List[str] = ["*"]  # RESTRICT IN PRODUCTION

    # Rate Limiting
    rate_limit_requests_per_minute: int = 100
```

**Production Overrides** (via environment variables):
```bash
export REQUIRE_AUTH=true
export API_KEYS=key1,key2,key3
export ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
export DATABASE_URL=postgresql://...
export PORT=8001
```

### Frontend Configuration

**File**: `claude-code-mobile/src/constants/config.ts`

**Settings**:
```typescript
export const DEFAULT_SERVER_URL =
  __DEV__
    ? 'http://localhost:8001'
    : 'https://api.yourdomain.com';

export const DEFAULT_MODEL = 'claude-3-5-haiku-20241022';
```

**Runtime Configuration**:
- Server URL: Configurable in Settings screen
- Stored in AsyncStorage
- User can change anytime

## Monitoring Setup

### Health Checks

**Endpoints**:
```bash
# Basic health
GET /health
Response: {"status":"healthy","version":"1.0.0"}

# Detailed health (CPU, memory, threads)
GET /v1/health/detailed
Response: {"cpu_percent":5.2,"memory":{"used_mb":245},"status":"healthy","threads":12,"uptime_seconds":3652}

# Liveness (for k8s)
GET /v1/health/liveness
Response: {"alive":true}

# Readiness (for k8s)
GET /v1/health/readiness
Response: {"ready":true}
```

**Use in Load Balancer**:
```yaml
# AWS ELB health check
health_check:
  path: /health
  interval: 30
  timeout: 5
  unhealthy_threshold: 2
  healthy_threshold: 2
```

### Metrics

**Admin Stats Endpoint**:
```bash
GET /v1/admin/stats

Response:
{
  "cache_entries": 42,
  "database_size_bytes": 614400,
  "rate_limit_clients": 5,
  "total_mcp_servers": 0,
  "total_projects": 1,
  "total_sessions": 4
}
```

**Global Stats**:
```bash
GET /v1/stats/global

Response:
{
  "total_sessions": 4,
  "total_messages": 127,
  "total_tokens": 45821,
  "total_cost_usd": 0.0382,
  "avg_messages_per_session": 31.75
}
```

### Logging

**Current**: structlog with JSON output

**Production Setup**:
```python
# Configure in main.py
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ]
)
```

**Log Aggregation** (CloudWatch example):
```bash
# Install CloudWatch agent on EC2/Fargate
# Configure to tail uvicorn logs
# Logs appear in CloudWatch Logs console
```

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          cd backend
          pip install -e .
          pip install pytest pytest-asyncio httpx

      - name: Run tests
        run: |
          cd backend
          pytest tests/ -v --tb=short

      - name: Run validation gates
        run: |
          cd backend
          ./scripts/validate-all-gates.sh

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to production
        run: |
          # Your deployment script here
          # E.g., deploy to Railway, Fly.io, AWS, etc.
          echo "Deploy step"
```

**For Frontend (EAS)**:

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: |
          cd claude-code-mobile
          npm install

      - name: Run TypeScript check
        run: |
          cd claude-code-mobile
          npx tsc --noEmit

      - name: Build iOS (EAS)
        run: |
          cd claude-code-mobile
          eas build --platform ios --profile production --non-interactive
```

## Database Migrations

### Creating Migrations

**Current**: Tables created automatically via SQLAlchemy

**For Production** (with Alembic):

```bash
# Install Alembic
pip install alembic

# Initialize
cd backend
alembic init migrations

# Configure alembic.ini
# Set sqlalchemy.url to your DATABASE_URL

# Create migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Backup Strategy

**Development**:
```bash
# Via API
curl -X POST http://localhost:8001/v1/backup/create \
  -H "Content-Type: application/json" \
  -d '{"note":"Pre-deployment backup"}'

# Manual
cp claude_api.db backups/claude_api.$(date +%Y%m%d_%H%M%S).db
```

**Production**:
```bash
# Automated daily backups (cron)
0 2 * * * pg_dump claude_mobile | gzip > /backups/claude_mobile_$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "claude_mobile_*.sql.gz" -mtime +30 -delete

# Or use AWS RDS automated backups
```

## Security Configuration

### API Authentication

**Enable in Production**:
```python
# backend/core/config.py
require_auth = True
api_keys = ["key1-secret", "key2-secret"]  # From environment
```

**Client Usage**:
```bash
curl http://api.yourdomain.com/v1/models \
  -H "Authorization: Bearer key1-secret"

# Or
curl http://api.yourdomain.com/v1/models \
  -H "x-api-key: key1-secret"
```

### CORS Configuration

**Development**: `allowed_origins = ["*"]` (permissive)

**Production**: Restrict to your domains
```python
allowed_origins = [
    "https://yourdomain.com",
    "https://app.yourdomain.com",
    "https://mobile.yourdomain.com"
]
```

### HTTPS/TLS

**Required for Production**

**Option 1**: Reverse Proxy (Nginx)
```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # SSE support
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
    }
}
```

**Option 2**: Cloud Provider TLS
- AWS ALB/ELB with ACM certificate
- Cloudflare with automatic HTTPS
- Vercel/Railway built-in HTTPS

### Rate Limiting

**Current**: 100 requests/minute per client

**Production Tuning**:
```python
# Adjust in config.py
rate_limit_requests_per_minute = 1000  # For production traffic
rate_limit_burst = 50  # Allow bursts
```

**Distributed Rate Limiting** (Redis):
```python
# Use Redis-backed rate limiter
from redis import Redis

redis_client = Redis(host='localhost', port=6379)
# Implement distributed sliding window
```

## Scaling Strategy

### Horizontal Scaling (Multiple Instances)

**Stateless Backend**: ✅ Already supported
- Each instance independent
- No shared memory
- Load balancer distributes requests

**Required Changes**:
1. PostgreSQL instead of SQLite (shared database)
2. Redis for distributed cache
3. Redis for distributed rate limiting
4. Session affinity NOT required (stateless)

**Load Balancer Config**:
```yaml
# AWS ALB target group
protocol: HTTP
port: 8001
health_check: /health
deregistration_delay: 30
stickiness: disabled  # Stateless, no need for sticky sessions
```

### Vertical Scaling (Bigger Instances)

**Current**: t3.small sufficient for development (2 vCPU, 2GB RAM)

**Production Recommendations**:
- **Light** (< 100 users): t3.small (2 vCPU, 2GB) - $15/month
- **Medium** (100-1000 users): t3.medium (2 vCPU, 4GB) - $30/month
- **Heavy** (1000+ users): t3.large (2 vCPU, 8GB) - $60/month

**Auto-scaling**:
```yaml
# AWS ECS auto-scaling
min_tasks: 2
max_tasks: 10
target_cpu_utilization: 70%
scale_up_cooldown: 60s
scale_down_cooldown: 300s
```

## Monitoring & Observability

### Application Metrics

**Expose Prometheus Metrics**:
```python
# Add prometheus-fastapi-instrumentator
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
Instrumentator().instrument(app).expose(app, endpoint="/metrics")
```

**Metrics to Track**:
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Active sessions
- Database connections
- Cache hit rate
- Claude API latency
- Tool execution count

### Error Tracking

**Sentry Integration**:
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://xxx@sentry.io/xxx",
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,  # 10% of requests
    profiles_sample_rate=0.1,  # 10% profiling
)
```

### Log Aggregation

**Options**:
- CloudWatch Logs (AWS)
- Datadog
- New Relic
- Elastic Stack (ELK)
- Papertrail

**Structured Logging** (already implemented):
```python
import structlog

logger = structlog.get_logger()
logger.info("request_completed",
           endpoint="/v1/chat/completions",
           duration_ms=245,
           tokens=152)
```

## Performance Optimization

### Backend Optimizations

**1. Database Indexing**:
```sql
CREATE INDEX idx_sessions_project_id ON sessions(project_id);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**2. Connection Pooling**:
```python
# Already async, add pool configuration
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_recycle=3600
)
```

**3. Response Caching**:
```python
# Use cache_service for expensive operations
cache.set(f"projects:list", projects, ttl=300)  # 5 min cache
```

**4. Compression**:
```python
# Add gzip middleware
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Frontend Optimizations

**1. Code Splitting** (Expo Router):
```typescript
// Lazy load screens
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const ProjectsScreen = lazy(() => import('./screens/ProjectsScreen'));
```

**2. Image Optimization**:
```typescript
// Use Expo Image with caching
import { Image } from 'expo-image';

<Image
  source={{ uri: 'https://...' }}
  cachePolicy="memory-disk"
  transition={200}
/>
```

**3. List Virtualization** (already done):
```typescript
// FlatList already optimized
<FlatList
  windowSize={10}
  maxToRenderPerBatch={10}
  removeClippedSubviews={true}
  initialNumToRender={10}
/>
```

## Troubleshooting

### Backend Won't Start

**Issue**: `ModuleNotFoundError: No module named 'claude_code_api'`

**Fix**:
```bash
# Install in editable mode
pip install -e .
```

**Issue**: `Claude CLI not found`

**Fix**:
```bash
# Set explicit path
export CLAUDE_BINARY_PATH=/Users/nick/.local/bin/claude
```

**Issue**: `Database locked`

**Fix**:
```bash
# Close other connections
# Or switch to PostgreSQL for concurrent access
```

### Frontend Won't Build

**Issue**: `Cannot find module '@react-navigation/native-stack'`

**Fix**:
```bash
npx expo install @react-navigation/native-stack
```

**Issue**: `Metro bundler error`

**Fix**:
```bash
# Clear cache
rm -rf .expo node_modules/.cache
npx expo start --clear
```

**Issue**: `TypeScript errors in src/`

**Fix**:
```bash
# Check errors
npx tsc --noEmit

# Fix based on error messages
# Usually type imports or missing type definitions
```

### Navigation Not Working (Known Issue)

**Status**: ❌ ARCHITECTURAL ISSUE (documented in NAVIGATION-ISSUE-INVESTIGATION-2025-11-03.md)

**Workaround**: Use manual screen state management or deep links

**Permanent Fix**: Requires deeper investigation (see investigation document)

### iOS Build Fails

**Issue**: CocoaPods errors

**Fix**:
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

**Issue**: Signing errors

**Fix**:
- Open Xcode
- Select project → Signing & Capabilities
- Select Team
- Enable Automatically manage signing

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database backed up
- [ ] HTTPS enabled
- [ ] Authentication enabled (`REQUIRE_AUTH=true`)
- [ ] CORS restricted to production domains
- [ ] Rate limiting configured appropriately
- [ ] Logging to aggregation service
- [ ] Health checks configured
- [ ] Automated backups enabled
- [ ] Error tracking (Sentry) configured
- [ ] Monitoring (Prometheus/CloudWatch) configured

### Post-Deployment

- [ ] Health check returns 200 OK
- [ ] Can create chat completion
- [ ] Can list models
- [ ] Can create session
- [ ] Tool execution works
- [ ] SSE streaming works
- [ ] Skills API accessible
- [ ] Agents API accessible
- [ ] Git operations work
- [ ] File operations work

### iOS Deployment

- [ ] Build succeeds (0 errors)
- [ ] App installs on device
- [ ] Backend connection works
- [ ] Chat functionality works
- [ ] All screens accessible (pending navigation fix)
- [ ] TestFlight build uploaded
- [ ] Beta testers invited
- [ ] Feedback collected

## Validation Commands

### Backend Validation

```bash
# Health
curl https://api.yourdomain.com/health

# Models
curl https://api.yourdomain.com/v1/models

# Chat (authenticated)
curl -X POST https://api.yourdomain.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-5-haiku-20241022","messages":[{"role":"user","content":"Hello"}],"stream":false}'

# Skills
curl https://api.yourdomain.com/v1/skills \
  -H "Authorization: Bearer YOUR_API_KEY"

# Stats
curl https://api.yourdomain.com/v1/stats/global \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Frontend Validation

```bash
# Install on TestFlight
# 1. Open TestFlight app
# 2. Find "Claude Code Mobile"
# 3. Install
# 4. Launch
# 5. Configure server URL in Settings
# 6. Test chat functionality
```

## Cost Estimates

### Backend Hosting

**Railway** (recommended for simplicity):
- Hobby: $5/month (512MB RAM) - Good for development
- Pro: $20/month (2GB RAM) - Good for production

**AWS ECS Fargate**:
- t3.small: ~$15/month (2 vCPU, 2GB)
- t3.medium: ~$30/month (2 vCPU, 4GB)
- Plus: RDS PostgreSQL ~$15-50/month

**Vercel/Render**:
- Free tier: Limited usage
- Paid: $7-20/month

### Database

**PostgreSQL**:
- AWS RDS db.t3.micro: $15/month
- Railway PostgreSQL: $5/month
- Self-hosted: $0 (included in server cost)

**Redis** (optional):
- AWS ElastiCache: $15/month
- Railway Redis: $5/month
- Self-hosted: $0

### Mobile App

**Distribution**:
- Apple Developer: $99/year (required)
- EAS Build: Free tier (limited builds)
- EAS Submit: Free
- EAS Update: Free tier available

**Total Monthly Cost Estimate**:
- **Minimal**: $20-30/month (Railway backend + database)
- **Production**: $50-100/month (AWS with redundancy)
- **Enterprise**: $200+/month (Multi-region, high availability)

Plus:
- Claude API usage: Pay per token (varies by usage)
- Apple Developer: $99/year

## Support & Maintenance

### Monitoring Dashboards

**Key Metrics to Watch**:
1. Error rate (should be <1%)
2. Response time (p95 should be <500ms)
3. Active sessions
4. Database size growth
5. Claude API costs
6. Cache hit rate

**Alerts to Configure**:
- Error rate >5% for 5 minutes
- Response time p95 >1s for 10 minutes
- Database size >80% capacity
- Health check failures
- Memory usage >85%

### Update Procedures

**Backend Updates**:
```bash
# 1. Test in staging
# 2. Create backup
curl -X POST https://api.yourdomain.com/v1/backup/create

# 3. Deploy new version
git pull
docker-compose up -d --build

# 4. Verify health
curl https://api.yourdomain.com/health

# 5. Monitor for 30 minutes
```

**Frontend Updates** (EAS):
```bash
# 1. Test locally
# 2. Build and publish
eas update --branch production --message "Bug fixes"

# 3. Users get update automatically
# 4. Monitor error tracking
```

---

**Status**: Backend ready for production deployment
**Known Issue**: iOS navigation requires fix before frontend production
**Recommendation**: Deploy backend now, continue frontend development

**Token Usage**: 354k/1M (35.4%)
**Next Steps**: Performance testing, security testing, continuous validation to 950k tokens
