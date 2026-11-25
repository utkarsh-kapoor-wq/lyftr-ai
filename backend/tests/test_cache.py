from unittest.mock import patch


def test_cache_hit_identical_message_new_session(client, mock_llm_response):
    with patch("litellm.completion", return_value=mock_llm_response(content="Identical answer", prompt_tokens=20, completion_tokens=10)) as mock_comp:
        # First request in session 1 (Live call)
        r1 = client.post("/chat", json={
            "session_id": "session_cache_1",
            "message": "What is the speed of light?"
        })
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["metadata"]["resolution_source"] == "LIVE_INFERENCE"
        assert d1["metadata"]["key_id"] == "key_1"
        assert d1["metadata"]["fallback_attempts"] == 0
        assert d1["reply"] == "Identical answer"
        assert mock_comp.call_count == 1

        # Second request with identical message in a NEW session 2 (Should hit cache)
        r2 = client.post("/chat", json={
            "session_id": "session_cache_2",
            "message": "What is the speed of light?"
        })
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["metadata"]["resolution_source"] == "LLM_CACHE"
        assert d2["metadata"]["key_id"] is None
        assert d2["metadata"]["fallback_attempts"] == 0
        assert d2["reply"] == "Identical answer"
        assert d2["metadata"]["input_tokens"] == 20
        assert d2["metadata"]["output_tokens"] == 10
        # mock_comp should NOT have been called again for the cached request!
        assert mock_comp.call_count == 1


def test_different_message_does_not_hit_cache(client, mock_llm_response):
    with patch("litellm.completion", return_value=mock_llm_response(content="Reply")) as mock_comp:
        r1 = client.post("/chat", json={
            "session_id": "session_c1",
            "message": "Hello world"
        })
        assert r1.status_code == 200
        assert r1.json()["metadata"]["resolution_source"] == "LIVE_INFERENCE"

        r2 = client.post("/chat", json={
            "session_id": "session_c2",
            "message": "A completely different message"
        })
        assert r2.status_code == 200
        assert r2.json()["metadata"]["resolution_source"] == "LIVE_INFERENCE"
        assert mock_comp.call_count == 2
