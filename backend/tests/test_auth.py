import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "ok")
    assert data["database"] == "connected"


@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    email = "newauthuser@example.com"
    password = "StrongPassword456"

    # Register
    reg_resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "fullName": "Auth Test User"
    })
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "accessToken" in reg_data
    assert reg_data["user"]["email"] == email

    # Duplicate registration should return 409 Conflict
    dup_resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "fullName": "Duplicate User"
    })
    assert dup_resp.status_code == 409

    # Login
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "accessToken" in login_data

    # Invalid login
    bad_login = await client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "WrongPassword"
    })
    assert bad_login.status_code == 401


@pytest.mark.asyncio
async def test_profile_and_me(client: AsyncClient, auth_headers: dict):
    # GET /auth/me
    me_resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "user1@example.com"

    # PATCH /auth/profile
    patch_resp = await client.patch("/api/v1/auth/profile", headers=auth_headers, json={
        "fullName": "Updated Test User 1",
        "preferences": {
            "theme": "dark",
            "timezone": "America/New_York",
            "dailyGoalMinutes": 360,
            "defaultCategory": "Learning"
        }
    })
    assert patch_resp.status_code == 200
    updated_data = patch_resp.json()
    assert updated_data["fullName"] == "Updated Test User 1"
    assert updated_data["preferences"]["theme"] == "dark"
