# Backend Service - LiteLLM Multi-Turn Chat

Maintained by **Utkarsh Kapoor** (`kapoorutkarsh17@gmail.com`).

## Architecture
- **FastAPI**: Asynchronous web framework with strict Pydantic v2 schemas.
- **LiteLLM**: Unified LLM gateway providing key pool fallback and local in-memory caching.
- **SQLite**: Local persistence for sessions and messages with automated migration on startup.

## Testing
Run test suite with pytest:
```bash
pytest -v
```

## Running
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
