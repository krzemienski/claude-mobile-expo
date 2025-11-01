# Backend Enhancement & Deployment Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal**: Enhance validated backend with deployment artifacts, examples, performance optimization, and production readiness

**Current State**: Backend 40/40 validation PASSED, 40+ APIs functional, 7,767 Python lines

**Architecture**: Add Docker deployment, CI/CD, comprehensive examples, performance benchmarks, code quality improvements

**Tech Stack**: Docker, GitHub Actions, pytest-benchmark, Black, mypy

**Token Budget**: 440k remaining, ~50k per major task

---

## Task 1: Docker Deployment Setup

**Goal**: Make backend deployable via Docker for easy production deployment

**Files**:
- Create: `backend/Dockerfile`
- Create: `backend/docker-compose.yml`
- Create: `backend/.dockerignore`
- Create: `backend/docker-entrypoint.sh`

**Step 1: Create Dockerfile**

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY pyproject.toml setup.py ./
RUN pip install -e .

# Copy application
COPY claude_code_api/ ./claude_code_api/

EXPOSE 8001

CMD ["uvicorn", "claude_code_api.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Step 2: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - PORT=8001
      - DATABASE_URL=sqlite:///./data/claude_api.db
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

**Step 3: Test Docker build**

```bash
cd backend
docker build -t claude-mobile-backend .
```

Expected: Build succeeds, no errors

**Step 4: Test Docker run**

```bash
docker run -p 8001:8001 claude-mobile-backend
curl http://localhost:8001/health
```

Expected: `{"status":"healthy"}`

**Step 5: Commit**

```bash
git add backend/Dockerfile backend/docker-compose.yml backend/.dockerignore
git commit -m "feat: add Docker deployment configuration"
```

---

## Task 2: GitHub Actions CI/CD

**Goal**: Automated validation on every push

**Files**:
- Create: `.github/workflows/backend-validation.yml`

**Step 1: Create workflow file**

```yaml
name: Backend Validation

on: [push, pull_request]

jobs:
  validate:
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

      - name: Run Gate B1
        run: ./backend/validate-b1.sh

      - name: Run Gate B2
        run: ./backend/validate-b2.sh

      - name: Run Gate B3
        run: ./backend/validate-b3.sh

      - name: Run Gate B4
        run: ./backend/validate-b4.sh

      - name: All Gates Summary
        run: ./backend/validate-all-gates.sh
```

**Step 2: Test workflow locally**

```bash
# Install act (GitHub Actions local runner)
brew install act
act push
```

**Step 3: Commit and push**

```bash
git add .github/workflows/backend-validation.yml
git commit -m "ci: add GitHub Actions workflow for automated validation"
git push
```

**Step 4: Verify on GitHub**

Check Actions tab, verify all gates pass

---

## Task 3: Comprehensive API Examples

**Goal**: Working curl examples for every endpoint

**Files**:
- Create: `backend/examples/curl-examples.sh`
- Create: `backend/examples/python-client-example.py`

**Step 1: Create curl examples script**

```bash
#!/bin/bash
# Complete API examples for all 40+ endpoints

BASE_URL="http://localhost:8001"

echo "=== FILE OPERATIONS ==="
# List files
curl "$BASE_URL/v1/files/list?path=/tmp"

# Read file
curl "$BASE_URL/v1/files/read?path=/tmp/test.txt"

# Write file
curl -X POST "$BASE_URL/v1/files/write" \
  -H "Content-Type: application/json" \
  -d '{"path":"/tmp/test.txt","content":"Hello"}'

# ... (all 40 endpoints)
```

**Step 2: Create Python client example**

```python
import requests

BASE_URL = "http://localhost:8001"

# Chat completion
response = requests.post(f"{BASE_URL}/v1/chat/completions", json={
    "model": "claude-3-5-haiku-20241022",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": False
})

print(response.json())

# ... (all endpoints)
```

**Step 3: Test all examples**

```bash
chmod +x backend/examples/curl-examples.sh
./backend/examples/curl-examples.sh
```

Expected: All commands succeed

**Step 4: Commit**

```bash
git add backend/examples/
git commit -m "docs: add comprehensive API usage examples"
```

---

## Task 4: Performance Benchmarking

**Goal**: Measure and document API performance

**Files**:
- Create: `backend/benchmark.py`
- Create: `backend/PERFORMANCE.md`

**Step 1: Create benchmark script**

```python
import requests
import time
from statistics import mean, median

BASE_URL = "http://localhost:8001"

def benchmark_endpoint(name, method, url, **kwargs):
    times = []
    for _ in range(10):
        start = time.time()
        requests.request(method, url, **kwargs)
        duration = (time.time() - start) * 1000
        times.append(duration)

    return {
        "endpoint": name,
        "mean_ms": mean(times),
        "median_ms": median(times),
        "min_ms": min(times),
        "max_ms": max(times),
    }

# Benchmark all endpoints
results = []
results.append(benchmark_endpoint("health", "GET", f"{BASE_URL}/health"))
results.append(benchmark_endpoint("list_files", "GET", f"{BASE_URL}/v1/files/list?path=/tmp"))
# ... all endpoints

print("Performance Benchmarks:")
for result in results:
    print(f"{result['endpoint']}: {result['mean_ms']:.1f}ms avg")
```

**Step 2: Run benchmarks**

```bash
python backend/benchmark.py > backend/benchmark-results.txt
```

**Step 3: Document results**

Create `backend/PERFORMANCE.md` with results and optimization notes

**Step 4: Commit**

```bash
git add backend/benchmark.py backend/PERFORMANCE.md
git commit -m "perf: add performance benchmarks and results"
```

---

## Task 5: Code Quality Improvements

**Goal**: Perfect code quality (linting, types, docs)

**Files**:
- Modify: All `backend/claude_code_api/**/*.py` files

**Step 1: Run Black formatter**

```bash
cd backend
black claude_code_api/
```

**Step 2: Run isort**

```bash
isort claude_code_api/
```

**Step 3: Run mypy type checker**

```bash
mypy claude_code_api/ --ignore-missing-imports
```

Fix any type errors

**Step 4: Verify all functions have docstrings**

```bash
# Check for functions without docstrings
grep -r "def " claude_code_api/ | grep -v '"""' | wc -l
```

Add missing docstrings

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: apply Black, isort, add missing docstrings"
```

---

## Task 6: Integration Tutorials

**Goal**: Step-by-step guides for common workflows

**Files**:
- Create: `docs/tutorials/file-browser-integration.md`
- Create: `docs/tutorials/git-operations-from-mobile.md`
- Create: `docs/tutorials/mcp-setup.md`

**Content for each tutorial**:
1. Prerequisites
2. Step-by-step with exact commands
3. Expected output at each step
4. Troubleshooting common issues
5. Complete working example

**Commit**:

```bash
git add docs/tutorials/
git commit -m "docs: add integration tutorials"
```

---

## Task 7: Load Testing

**Goal**: Verify backend handles concurrent requests

**Files**:
- Create: `backend/load-test.py`

**Step 1: Create load test script**

```python
import concurrent.futures
import requests
import time

BASE_URL = "http://localhost:8001"

def send_request(i):
    response = requests.get(f"{BASE_URL}/v1/files/list?path=/tmp")
    return response.status_code == 200

# Test with 50 concurrent requests
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    futures = [executor.submit(send_request, i) for i in range(50)]
    results = [f.result() for f in futures]

success_count = sum(results)
print(f"Load test: {success_count}/50 successful")
```

**Step 2: Run load test**

```bash
python backend/load-test.py
```

Expected: 50/50 successful, no crashes

**Step 3: Commit**

```bash
git add backend/load-test.py
git commit -m "test: add load testing for concurrent requests"
```

---

## Task 8: Production Checklist

**Goal**: Pre-deployment validation checklist

**Files**:
- Create: `backend/PRODUCTION-CHECKLIST.md`

**Content**:
- [ ] All 40 gates pass
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] HTTPS enabled
- [ ] Authentication enabled
- [ ] CORS restricted to production domains
- [ ] Rate limiting configured
- [ ] Logs aggregated
- [ ] Health checks configured
- [ ] Backups automated

**Commit**:

```bash
git add backend/PRODUCTION-CHECKLIST.md
git commit -m "docs: add production deployment checklist"
```

---

## Validation

After all tasks complete:

```bash
./backend/validate-all-gates.sh
docker-compose up -d
curl http://localhost:8001/health
python backend/benchmark.py
python backend/load-test.py
```

All should pass.

---

## Estimated Effort

- Docker setup: 40k tokens
- CI/CD: 30k tokens
- Examples: 60k tokens
- Performance: 40k tokens
- Quality: 50k tokens
- Tutorials: 50k tokens
- Load testing: 30k tokens
- Checklist: 20k tokens

**Total**: ~320k tokens (leaves 120k buffer)

---

**Status**: Plan ready for execution with remaining token budget.
