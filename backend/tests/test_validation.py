def test_validation_missing_session_id(client):
    response = client.post("/chat", json={"message": "hello"})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_validation_empty_session_id(client):
    response = client.post("/chat", json={"session_id": "", "message": "hello"})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_validation_whitespace_session_id(client):
    response = client.post("/chat", json={"session_id": "   ", "message": "hello"})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_validation_long_session_id(client):
    response = client.post("/chat", json={"session_id": "a" * 129, "message": "hello"})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_validation_missing_message(client):
    response = client.post("/chat", json={"session_id": "s1"})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_validation_empty_message(client):
    response = client.post("/chat", json={"session_id": "s1", "message": ""})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_validation_whitespace_only_message(client):
    response = client.post("/chat", json={"session_id": "s1", "message": "   \n\t  "})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_validation_message_exceeds_4000_chars(client):
    response = client.post("/chat", json={"session_id": "s1", "message": "x" * 4001})
    assert response.status_code == 422
    assert "detail" in response.json()


def test_validation_malformed_json(client):
    response = client.post(
        "/chat",
        content="{invalid_json:",
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422
    assert "detail" in response.json()
