from unittest.mock import patch


def test_multiturn_memory_and_system_prompt(client, mock_llm_response):
    recorded_calls = []

    def fake_completion(**kwargs):
        recorded_calls.append(kwargs)
        return mock_llm_response(content=f"Reply to turn {len(recorded_calls)}")

    with patch("litellm.completion", side_effect=fake_completion):
        # Turn 1 with explicit system prompt
        r1 = client.post("/chat", json={
            "session_id": "session_multi",
            "message": "Turn 1 question",
            "system_prompt": "You are a specialized math bot."
        })
        assert r1.status_code == 200

        # Turn 2 without passing system prompt (should use stored system prompt)
        r2 = client.post("/chat", json={
            "session_id": "session_multi",
            "message": "Turn 2 question"
        })
        assert r2.status_code == 200

    assert len(recorded_calls) == 2
    # Check turn 1 messages sent to LLM
    call1_messages = recorded_calls[0]["messages"]
    assert call1_messages[0] == {"role": "system", "content": "You are a specialized math bot."}
    assert call1_messages[1] == {"role": "user", "content": "Turn 1 question"}

    # Check turn 2 messages sent to LLM: should have system prompt + turn 1 user + turn 1 assistant + turn 2 user
    call2_messages = recorded_calls[1]["messages"]
    assert len(call2_messages) == 4
    assert call2_messages[0] == {"role": "system", "content": "You are a specialized math bot."}
    assert call2_messages[1] == {"role": "user", "content": "Turn 1 question"}
    assert call2_messages[2] == {"role": "assistant", "content": "Reply to turn 1"}
    assert call2_messages[3] == {"role": "user", "content": "Turn 2 question"}


def test_session_isolation(client, mock_llm_response):
    recorded_calls = []

    def fake_completion(**kwargs):
        recorded_calls.append(kwargs)
        return mock_llm_response(content="Reply")

    with patch("litellm.completion", side_effect=fake_completion):
        client.post("/chat", json={"session_id": "session_A", "message": "Message for A"})
        client.post("/chat", json={"session_id": "session_B", "message": "Message for B"})

    assert len(recorded_calls) == 2
    # Session B should NOT contain session A's messages
    call_b_messages = recorded_calls[1]["messages"]
    user_contents = [m["content"] for m in call_b_messages if m["role"] == "user"]
    assert "Message for A" not in user_contents
    assert "Message for B" in user_contents


def test_history_endpoint_shape_order_and_404(client, mock_llm_response):
    # Unknown session -> 404
    r_404 = client.get("/sessions/unknown_session_xyz/messages")
    assert r_404.status_code == 404
    assert r_404.json() == {"detail": "session not found"}

    with patch("litellm.completion", return_value=mock_llm_response(content="Assistant reply")):
        client.post("/chat", json={
            "session_id": "session_hist",
            "message": "User question"
        })

    hist_resp = client.get("/sessions/session_hist/messages")
    assert hist_resp.status_code == 200
    data = hist_resp.json()
    assert data["session_id"] == "session_hist"
    messages = data["messages"]
    assert len(messages) == 2

    # Oldest first: user first, then assistant
    assert messages[0]["role"] == "user"
    assert messages[0]["content"] == "User question"
    assert messages[0]["metadata"] is None

    assert messages[1]["role"] == "assistant"
    assert messages[1]["content"] == "Assistant reply"
    assert messages[1]["metadata"]["resolution_source"] == "LIVE_INFERENCE"
    assert messages[1]["metadata"]["input_tokens"] == 15
    assert messages[1]["metadata"]["output_tokens"] == 8
