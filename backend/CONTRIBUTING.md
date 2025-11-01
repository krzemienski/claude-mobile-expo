# Contributing Guide

## Development Setup

1. Clone repository
2. Install: `pip install -e .`
3. Run: `python -m uvicorn claude_code_api.main:app --reload`
4. Validate: `./validate-all-gates.sh`

## Adding New API Endpoint

1. **Create Pydantic models** in `models/`:
```python
class MyRequest(BaseModel):
    param: str = Field(..., description="Parameter")
```

2. **Create service method** in `services/`:
```python
class MyService:
    def my_operation(self, param: str) -> dict:
        # Implementation
        return {"result": "success"}
```

3. **Create API router** in `api/`:
```python
@router.get("/my-endpoint")
async def my_endpoint(param: str):
    result = my_service.my_operation(param)
    return result
```

4. **Register in main.py**:
```python
from claude_code_api.api.my_api import router as my_router
app.include_router(my_router, prefix="/v1", tags=["my-feature"])
```

5. **Add validation** in `validate-*.sh`
6. **Document** in `API-REFERENCE.md`

## Code Style

- Use Black formatting
- Type hints required
- Docstrings for all public methods
- Structured logging with structlog

## Testing

**Before committing**:
```bash
./validate-all-gates.sh  # Must pass 40/40
```

**For new features**:
- Add functional tests to appropriate validate-*.sh script
- Test with curl
- Verify error handling

## Pull Request Process

1. Create feature branch
2. Implement feature
3. Add validation tests
4. Run `./validate-all-gates.sh`
5. Update documentation
6. Submit PR with test results

## Validation Requirements

All PRs must:
- Pass all 40 gate tests
- Include functional tests
- Update API documentation
- Not break existing endpoints

## File Organization

```
backend/
├── claude_code_api/
│   ├── api/          # API routers
│   ├── core/         # Core functionality
│   ├── models/       # Pydantic models
│   ├── services/     # Business logic
│   ├── middleware/   # Request/response middleware
│   └── utils/        # Utilities
├── tests/            # Test files (if any)
├── validate-*.sh     # Validation scripts
└── *.md             # Documentation
```

## Commit Message Format

```
feat: add new feature
fix: correct bug
docs: update documentation
test: add validation
refactor: improve code
```

## Security

All file operations must use FileOperationsService for path validation.

Example:
```python
# ❌ WRONG
with open(path, 'r') as f:
    content = f.read()

# ✅ CORRECT
content = file_service.read_file(path)  # Validates path
```

## Questions

Run validation first: `./validate-all-gates.sh`

If issues, check logs and error handling tests.
