import os
import tempfile
import pytest
from fastapi.testclient import TestClient

# Configure environment before importing application
os.environ["LLM_API_KEYS"] = "test_key_1,test_key_2"
os.environ["LLM_MODEL"] = "gemini/gemini-2.0-flash"
os.environ["ENABLE_FAILURE_SIMULATION"] = "true"
os.environ["ALLOWED_ORIGINS"] = "*"
os.environ["DEFAULT_SYSTEM_PROMPT"] = "You are a helpful assistant."

import litellm
from litellm.caching import Cache
from litellm.types.utils import ModelResponse, Choices, Message, Usage
from app.main import app
from app.infrastructure.database import db
from app.infrastructure.llm_gateway import llm_gateway


@pytest.fixture(autouse=True)
def setup_test_environment(monkeypatch):
    """Provide isolated SQLite database and fresh LiteLLM cache per test."""
    temp_dir = tempfile.mkdtemp()
    test_db_path = os.path.join(temp_dir, "test_app.db")
    monkeypatch.setattr(db, "_db_path", test_db_path)
    db.init_db()

    # Reset cache
    litellm.cache = Cache(type="local")

    yield

    # Clean up
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    if os.path.exists(temp_dir):
        os.rmdir(temp_dir)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def mock_llm_response():
    def _create_response(content: str = "Test response from assistant", prompt_tokens: int = 15, completion_tokens: int = 8):
        return ModelResponse(
            id="chatcmpl-test-id",
            choices=[Choices(message=Message(content=content, role="assistant"))],
            usage=Usage(prompt_tokens=prompt_tokens, completion_tokens=completion_tokens, total_tokens=prompt_tokens + completion_tokens)
        )
    return _create_response
