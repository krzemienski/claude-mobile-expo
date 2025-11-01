# Testing Guide

## Validation Scripts

### Run All Backend Tests (40 tests)

```bash
./backend/validate-all-gates.sh
```

Expected output:
```
FINAL RESULT: 40 PASSED, 0 FAILED
✅ ALL GATES PASSED
```

### Individual Gates

```bash
./backend/validate-b1.sh  # File operations (10 tests)
./backend/validate-b2.sh  # Git operations (10 tests)
./backend/validate-b3.sh  # MCP management (10 tests)
./backend/validate-b4.sh  # Advanced backend (10 tests)
```

Each script exits 0 if all tests pass, 1 if any fail.

### Comprehensive API Tests

```bash
./backend/comprehensive-api-tests.sh
```

Tests all 40+ endpoints with:
- Glob patterns
- Pagination
- Edge cases
- Advanced parameters

### Error Handling Tests

```bash
./backend/error-handling-tests.sh
```

Validates:
- Proper HTTP error codes (404, 403, 400, 500)
- Security (directory traversal blocked)
- Error message format
- Boundary conditions

## Manual API Testing

### File Operations

```bash
# List directory
curl "http://localhost:8001/v1/files/list?path=/tmp"

# Read file
curl "http://localhost:8001/v1/files/read?path=/tmp/test.txt"

# Write file
curl -X POST "http://localhost:8001/v1/files/write" \
  -H "Content-Type: application/json" \
  -d '{"path":"/tmp/new.txt","content":"Hello"}'

# Search files
curl "http://localhost:8001/v1/files/search?root=/tmp&query=test"
```

### Git Operations

```bash
# Git status
curl "http://localhost:8001/v1/git/status?project_path=$(pwd)"

# Git log
curl "http://localhost:8001/v1/git/log?project_path=$(pwd)&max=5"

# Create commit
curl -X POST "http://localhost:8001/v1/git/commit" \
  -H "Content-Type: application/json" \
  -d '{"project_path":"'$(pwd)'","message":"Test commit"}'
```

### MCP Management

```bash
# List MCPs
curl "http://localhost:8001/v1/mcp/servers"

# Add MCP
curl -X POST "http://localhost:8001/v1/mcp/servers" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","url":"http://localhost:3000","api_key":"key123"}'
```

## Test Coverage

**Gate Validation**: 40 systematic tests
**Comprehensive Tests**: 30+ API tests
**Error Handling**: 15+ error case tests

**Total Test Coverage**: 85+ tests

## Continuous Integration

For CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Validate Backend
  run: |
    cd backend
    ./validate-all-gates.sh

- name: Comprehensive Tests
  run: |
    ./backend/comprehensive-api-tests.sh
```

Exit code 0 = all tests pass

## Performance Testing

Monitor response times:
```bash
time curl "http://localhost:8001/v1/files/list?path=/tmp"
time curl "http://localhost:8001/v1/git/log?project_path=$(pwd)&max=50"
```

Expected:
- File list: <100ms
- Git log: <200ms
- Commit: <500ms

## Security Testing

Test directory traversal prevention:
```bash
# Should return 403
curl "http://localhost:8001/v1/files/read?path=/etc/passwd"
curl "http://localhost:8001/v1/files/read?path=../../../../etc/shadow"
```

Test API key encryption:
```bash
# Add MCP with API key
curl -X POST "http://localhost:8001/v1/mcp/servers" \
  -d '{"name":"test","url":"http://localhost:3000","api_key":"secret"}'

# Verify key is encrypted in database
sqlite3 backend/claude_api.db "SELECT api_key_encrypted FROM mcp_servers WHERE name='test';"
# Should show encrypted string, not "secret"
```

## Regression Testing

After any code changes:

1. Run all gate validations: `./backend/validate-all-gates.sh`
2. Run comprehensive tests: `./backend/comprehensive-api-tests.sh`
3. Run error tests: `./backend/error-handling-tests.sh`
4. Check backend health: `curl http://localhost:8001/health`

All should pass with no degradation.
