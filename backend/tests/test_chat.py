from unittest.mock import patch
from app.infrastructure.database import db


def test_chat_success_response_shape(client, mock_llm_response):
    with patch("litellm.completion", return_value=mock_llm_response(content="Hello human!")):
        response = client.post("/chat", json={
            "session_id": "test_s1",
            "message": "Hello AI"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == "test_s1"
        assert data["reply"] == "Hello human!"
        assert "metadata" in data

        meta = data["metadata"]
        assert meta["resolution_source"] == "LIVE_INFERENCE"
        assert meta["model"] == "gemini/gemini-2.0-flash"
        assert isinstance(meta["latency_ms"], int)
        assert meta["latency_ms"] >= 0
        assert meta["input_tokens"] == 15
        assert meta["output_tokens"] == 8
        assert meta["key_id"] == "key_1"
        assert meta["fallback_attempts"] == 0


def test_chat_persists_messages_atomically(client, mock_llm_response):
    with patch("litellm.completion", return_value=mock_llm_response(content="Saved reply")):
        response = client.post("/chat", json={
            "session_id": "s_persist",
            "message": "User query"
        })
        assert response.status_code == 200

    messages = db.get_messages("s_persist")
    assert len(messages) == 2
    assert messages[0].role == "user"
    assert messages[0].content == "User query"
    assert messages[1].role == "assistant"
    assert messages[1].content == "Saved reply"
    assert messages[1].metadata is not None
    assert messages[1].metadata["resolution_source"] == "LIVE_INFERENCE"


def test_chat_failed_request_does_not_persist(client):
    response = client.post("/chat", json={
        "session_id": "s_failed",
        "message": ""
    })
    assert response.status_code == 422
    assert not db.session_exists("s_failed")
