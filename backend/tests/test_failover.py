from unittest.mock import patch
from app.infrastructure.database import db


def test_failover_single_key_429_success_key_2(client, mock_llm_response):
    with patch("litellm.completion", return_value=mock_llm_response(content="Fallback reply")) as mock_comp:
        response = client.post(
            "/chat",
            json={"session_id": "session_failover", "message": "Trigger failover"},
            headers={"X-Simulate-Failure": "key_1=429"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["reply"] == "Fallback reply"
        assert data["metadata"]["key_id"] == "key_2"
        assert data["metadata"]["fallback_attempts"] == 1
        assert data["metadata"]["resolution_source"] == "LIVE_INFERENCE"
        # Provider called once with key_2
        assert mock_comp.call_count == 1
        assert mock_comp.call_args[1]["api_key"] == "test_key_2"


def test_failover_single_key_500_success_key_2(client, mock_llm_response):
    with patch("litellm.completion", return_value=mock_llm_response(content="Recovered reply")):
        response = client.post(
            "/chat",
            json={"session_id": "session_failover_500", "message": "Trigger 500"},
            headers={"X-Simulate-Failure": "key_1=500"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["metadata"]["key_id"] == "key_2"
        assert data["metadata"]["fallback_attempts"] == 1


def test_failover_all_keys_unavailable_returns_503_and_preserves_history(client):
    with patch("litellm.completion") as mock_comp:
        response = client.post(
            "/chat",
            json={"session_id": "session_all_down", "message": "Down test"},
            headers={"X-Simulate-Failure": "*=429"}
        )
        assert response.status_code == 503
        data = response.json()
        assert data == {"detail": "all providers unavailable"}
        # No calls made to LLM provider
        assert mock_comp.call_count == 0

    # Ensure nothing was persisted to database
    assert not db.session_exists("session_all_down")


def test_failover_skips_cache_read_when_header_present(client, mock_llm_response):
    with patch("litellm.completion", return_value=mock_llm_response(content="Initial cached reply")):
        # Seed cache
        r1 = client.post("/chat", json={
            "session_id": "session_c_init",
            "message": "Common prompt message"
        })
        assert r1.status_code == 200
        assert r1.json()["metadata"]["resolution_source"] == "LIVE_INFERENCE"

    # Second call with same message and failover simulation should NOT return cache, but run failover
    with patch("litellm.completion", return_value=mock_llm_response(content="Live failover reply")):
        r2 = client.post(
            "/chat",
            json={
                "session_id": "session_c_new",
                "message": "Common prompt message"
            },
            headers={"X-Simulate-Failure": "key_1=429"}
        )
        assert r2.status_code == 200
        data = r2.json()
        assert data["metadata"]["resolution_source"] == "LIVE_INFERENCE"
        assert data["metadata"]["key_id"] == "key_2"
        assert data["metadata"]["fallback_attempts"] == 1
        assert data["reply"] == "Live failover reply"
