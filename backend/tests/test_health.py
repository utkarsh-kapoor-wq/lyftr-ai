def test_health_success(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["keys_configured"] == 2
    assert data["cache_enabled"] is True


def test_health_degraded_when_db_down(client, monkeypatch):
    from app.infrastructure.database import db
    monkeypatch.setattr(db, "check_health", lambda: False)

    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "degraded"
