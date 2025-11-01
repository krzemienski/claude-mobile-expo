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
- ✅ SSE Streaming: XMLHttpRequest-based (WORKING - see notes below)
- ✅ Production Ready: All validation gates passed

## Critical Implementation Notes

### SSE Streaming in React Native

**IMPORTANT**: React Native's `fetch()` does NOT support `ReadableStream.getReader()` for Server-Sent Events.

**What doesn't work**:
```typescript
// ❌ This HANGS in React Native:
const response = await fetch(url);
const reader = response.body.getReader();
const { value } = await reader.read(); // ← Hangs forever
```

**What works**:
```typescript
// ✅ Use XMLHttpRequest with onreadystatechange:
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
  if (xhr.readyState === 3) { // LOADING - progressive chunks
    processResponseText(xhr.responseText);
  }
};
```

**Implementation**: See `claude-code-mobile/src/services/http/sse.client.ts`

**References**:
- GitHub Issue #27741: fetch doesn't support streams
- GitHub Issue #25910: getReader not supported
- Solution: Pure XHR with ReadyState 3 callbacks
