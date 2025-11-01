# Deployment Guide - Claude Code Mobile

**Version**: 2.0.0
**Target**: Production deployment
**Platforms**: iOS (App Store), Android (Play Store), Backend (Cloud)

---

## 🎯 Overview

This guide covers deploying Claude Code Mobile to production:
- Backend: Python FastAPI to cloud (AWS, Railway, Fly.io)
- iOS: App Store via TestFlight
- Android: Play Store
- Database: SQLite → PostgreSQL migration
- Security: Authentication, SSL/TLS, API keys

---

## 📦 Backend Deployment

### Option 1: Railway (Recommended for ease)

**1. Install Railway CLI**:
```bash
npm install -g @railway/cli
railway login
```

**2. Create Railway project**:
```bash
cd backend
railway init
```

**3. Configure environment**:
```bash
railway variables set CLAUDE_BINARY_PATH=/usr/local/bin/claude
railway variables set DATABASE_URL=postgresql://...
railway variables set REQUIRE_AUTH=true
railway variables set API_KEYS=your-secure-key-here
```

**4. Deploy**:
```bash
railway up
```

**5. Get URL**:
```bash
railway domain
# Returns: https://your-app.railway.app
```

### Option 2: AWS Lambda + API Gateway

**Benefits**: Serverless, auto-scaling, pay-per-use

**Steps**:
1. Package backend as Lambda function
2. Configure API Gateway
3. Set up RDS for PostgreSQL
4. Deploy with SAM or CDK

### Option 3: Fly.io

**Benefits**: Docker-based, global deployment

```bash
fly launch
fly deploy
```

---

## 📱 iOS Deployment

### 1. Configure EAS Build

**Install EAS CLI**:
```bash
npm install -g eas-cli
eas login
```

**Configure eas.json**:
```json
{
  "build": {
    "production": {
      "ios": {
        "bundler": "metro",
        "simulator": false,
        "distribution": "store"
      }
    }
  }
}
```

### 2. Build for TestFlight

```bash
cd claude-code-mobile
eas build --platform ios --profile production
```

### 3. Submit to App Store

```bash
eas submit --platform ios
```

### 4. App Store Connect

- Upload screenshots (required: 6.7", 6.5", 5.5")
- Add app description
- Set privacy policy URL
- Configure in-app purchases (if needed)
- Submit for review

---

## 🤖 Android Deployment

### 1. Build Android APK/AAB

```bash
eas build --platform android --profile production
```

### 2. Google Play Console

- Create app listing
- Upload AAB file
- Add screenshots (phone, tablet, 7")
- Set content rating
- Submit for review

---

## 🗄️ Database Migration

### SQLite → PostgreSQL

**1. Export data**:
```bash
sqlite3 backend/claude_api.db .dump > backup.sql
```

**2. Set up PostgreSQL**:
```bash
# Railway
railway add postgresql

# AWS RDS
# Create RDS PostgreSQL instance via console

# Docker (local)
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

**3. Update DATABASE_URL**:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**4. Run migrations**:
```bash
cd backend
alembic upgrade head
```

---

## 🔐 Security Configuration

### Production Settings

**backend/.env.production**:
```env
REQUIRE_AUTH=true
API_KEYS=sk-prod-xxxxxxxxxxxx,sk-prod-yyyyyyyyyyyy
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_REQUESTS_PER_MINUTE=30
RATE_LIMIT_BURST=5
```

### SSL/TLS

**Railway/Fly.io**: Automatic HTTPS
**AWS**: Configure ACM certificate
**Custom**: Use Let's Encrypt with Nginx reverse proxy

---

## 📊 Monitoring & Logging

### Backend Logging

**Production logger config**:
```python
# Use structlog JSON format
# Send to CloudWatch, Datadog, or Sentry
```

### Error Tracking

**Add Sentry**:
```bash
pip install sentry-sdk
```

```python
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

### Performance Monitoring

**Add APM**:
- Datadog APM
- New Relic
- AWS X-Ray

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml**:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: \${{ secrets.RAILWAY_TOKEN }}

  deploy-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build with EAS
        run: eas build --platform ios --non-interactive
        env:
          EXPO_TOKEN: \${{ secrets.EXPO_TOKEN }}
```

---

## 🧪 Pre-Deployment Checklist

### Backend
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Authentication enabled
- [ ] Rate limiting configured
- [ ] CORS restricted
- [ ] Logging configured
- [ ] Error tracking setup
- [ ] Health check working
- [ ] All API tests passing

### Frontend
- [ ] Backend URL updated to production
- [ ] Error boundary implemented
- [ ] Offline mode tested
- [ ] All screens working
- [ ] TypeScript compiling
- [ ] No console.logs in production build
- [ ] App icons added
- [ ] Splash screen configured

### App Store
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Privacy policy created
- [ ] Terms of service added
- [ ] Support URL configured
- [ ] Age rating determined
- [ ] Pricing tier selected

---

## 🚀 Post-Deployment

### Monitoring

**Check daily**:
- Error rates (Sentry)
- API response times
- Database performance
- User analytics
- Crash reports

### Maintenance

**Weekly**:
- Review logs for errors
- Check disk usage
- Database backups
- Dependency updates

**Monthly**:
- Security patches
- Performance optimization
- Feature releases

---

## 📈 Scaling Considerations

### Backend Scaling

**Horizontal**: Multiple uvicorn workers
```bash
uvicorn main:app --workers 4
```

**Load Balancer**: Nginx, AWS ALB, Railway auto-scaling

**Database**: Read replicas, connection pooling

### App Performance

**Code splitting**: Lazy load screens
**Image optimization**: Compress assets
**Bundle size**: Analyze with `npx expo-doctor`

---

## 💰 Cost Estimation

### Backend (Railway)
- Starter: $5/month (512MB RAM)
- Pro: $20/month (2GB RAM)
- Plus usage: ~$0.01/hour active

### Expo EAS
- Free: Development builds
- Production: $99/month (unlimited builds)

### Claude API
- Haiku 3.5: $0.25/$1.25 per 1k tokens
- Estimate: $10-50/month (varies by usage)

### Total
- Development: ~$15/month
- Production: ~$150-200/month

---

## 🔧 Rollback Procedure

### If deployment fails:

**1. Revert backend**:
```bash
railway rollback
```

**2. Revert app**:
```bash
eas build --platform ios --profile previous
```

**3. Database restore**:
```bash
# Restore from backup
pg_restore backup.sql
```

---

## ✅ Deployment Complete

**Verify**:
- [ ] Backend health check returns 200
- [ ] App connects to production backend
- [ ] Can send and receive messages
- [ ] All screens accessible
- [ ] No crashes in first hour
- [ ] Monitoring showing data

**Go Live!** 🎉
