# Claude Code Mobile

ClaudeCode Mobile - iOS app with Python FastAPI backend providing OpenAI-compatible API for Claude Code CLI

## Quick Start

### Backend
```bash
cd backend
pip3 install -e .
uvicorn claude_code_api.main:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend
```bash
cd claude-code-mobile
npm install
npx expo start
```

## Documentation

See [CLAUDE.md](./CLAUDE.md) for complete project documentation.

## Repository

https://github.com/krzemienski/claude-mobile-expo

## Status

- ✅ Backend: Python FastAPI functional (Gate P1 PASSED)
- ✅ Frontend: HTTP/SSE migration complete (Gates F1, F2 PASSED)
- ✅ Integration: End-to-end testing complete (Gate I1 PASSED)
- ✅ Production Ready: All validation gates passed
