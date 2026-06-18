import pytest


@pytest.mark.asyncio
async def test_vote_success(client, approved_work, open_vote_channel):
    resp = await client.post("/api/vote", json={"work_id": str(approved_work.id), "phone": "13800138000"})
    assert resp.status_code == 200
    assert resp.json()["new_vote_count"] >= 1


@pytest.mark.asyncio
async def test_vote_duplicate(client, approved_work, open_vote_channel, seed_vote):
    resp = await client.post("/api/vote", json={"work_id": str(approved_work.id), "phone": "13800138000"})
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_vote_channel_closed(client, approved_work, close_vote_channel):
    resp = await client.post("/api/vote", json={"work_id": str(approved_work.id), "phone": "13800138000"})
    assert resp.status_code == 503
