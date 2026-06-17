# backend/tests/test_register.py
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient, tmp_image):
    resp = await client.post(
        "/api/register",
        data={"name": "张三", "address": "上海门店", "tax_id": "91310001", "phone": "13800138000"},
        files=[("images", ("test.jpg", tmp_image, "image/jpeg"))],
    )
    assert resp.status_code == 201
    assert "报名成功" in resp.json()["message"]


@pytest.mark.asyncio
async def test_register_duplicate_tax_id(client: AsyncClient, tmp_image, seed_contestant):
    resp = await client.post(
        "/api/register",
        data={"name": "张三", "address": "上海门店", "tax_id": "91310001", "phone": "13800138001"},
        files=[("images", ("test.jpg", tmp_image, "image/jpeg"))],
    )
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_register_channel_closed(client: AsyncClient, tmp_image, close_register_channel):
    resp = await client.post(
        "/api/register",
        data={"name": "张三", "address": "上海门店", "tax_id": "91310999", "phone": "13800138999"},
        files=[("images", ("test.jpg", tmp_image, "image/jpeg"))],
    )
    assert resp.status_code == 503
