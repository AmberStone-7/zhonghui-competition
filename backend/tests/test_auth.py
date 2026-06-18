# backend/tests/test_auth.py
import pytest


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    resp = await client.post("/api/admin/login", json={"username": "fake", "password": "wrong"})
    assert resp.status_code == 401
