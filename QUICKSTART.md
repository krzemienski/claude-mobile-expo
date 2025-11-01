# Quick Start Guide

Get Claude Code Mobile running in 5 minutes.

## Prerequisites

- macOS with Xcode
- Node.js 18+
- Python 3.10+
- Claude CLI 2.0+

## Setup (5 steps)

### 1. Clone Repository

```bash
git clone https://github.com/krzemienski/claude-mobile-expo
cd claude-mobile-expo
```

### 2. Install Backend Dependencies

```bash
cd backend
pip install -e .
```

### 3. Start Backend

```bash
python -m uvicorn claude_code_api.main:app --host 0.0.0.0 --port 8001 --reload
```

Backend now running on http://localhost:8001

### 4. Install Frontend Dependencies

```bash
cd ../claude-code-mobile
npm install
```

### 5. Start Mobile App

```bash
npx expo start
# Press 'i' for iOS simulator
```

## Verify Installation

**Backend Health**:
```bash
curl http://localhost:8001/health
```

Expected: `{"status":"healthy",...}`

**Run Validation**:
```bash
./backend/validate-all-gates.sh
```

Expected: `✅ ALL GATES PASSED (40/40)`

**Test Mobile App**:
1. Type message in chat input
2. Tap send button
3. See Claude response stream in

## Key Features to Test

**Chat**:
- Send messages
- Streaming responses
- Tool execution display

**File Browser**:
- Navigate directories
- Open code files
- View syntax highlighting

**Git**:
- View git status
- Create commits from mobile
- View commit history

**Projects**:
- Discover Claude Code projects
- Browse project files

**Settings**:
- Change model
- Configure server URL
- Manage sessions

## Troubleshooting

**Backend won't start**:
- Check Claude CLI: `claude --version`
- Check port 8001: `lsof -i :8001`

**Mobile app won't connect**:
- Update server URL in Settings
- Check backend is running
- Verify network connectivity

**Metro bundler issues**:
- Clear cache: `npx expo start --clear`
- Reinstall: `rm -rf node_modules && npm install`

## Next Steps

- Read ARCHITECTURE.md for system design
- Read API-REFERENCE.md for all endpoints
- Read TESTING.md for validation
- Read DEPLOYMENT.md for production setup

## Support

- Issues: https://github.com/krzemienski/claude-mobile-expo/issues
- Validation: Run `./backend/validate-all-gates.sh`
- Documentation: See *.md files in repository
