import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.db.indexes import create_db_indexes
from app.db.mongodb import mongodb
from app.main import app

TEST_DB_NAME = "dailyflow_test_db"


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_test_db():
    # Configure test database
    settings.MONGODB_DATABASE = TEST_DB_NAME
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URI)
    mongodb.db = mongodb.client[TEST_DB_NAME]
    await create_db_indexes(mongodb.db)

    yield

    # Teardown: drop test database
    try:
        await mongodb.client.drop_database(TEST_DB_NAME)
        mongodb.client.close()
    except Exception:
        pass


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    # Register & login user 1
    email = "user1@example.com"
    password = "SecretPassword123"
    reg_resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "fullName": "Test User 1"
    })
    if reg_resp.status_code == 201:
        token = reg_resp.json()["accessToken"]
    else:
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": password
        })
        token = login_resp.json()["accessToken"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def auth_headers_user2(client: AsyncClient):
    # Register & login user 2 for isolation tests
    email = "user2@example.com"
    password = "SecretPassword123"
    reg_resp = await client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "fullName": "Test User 2"
    })
    if reg_resp.status_code == 201:
        token = reg_resp.json()["accessToken"]
    else:
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": email,
            "password": password
        })
        token = login_resp.json()["accessToken"]
    return {"Authorization": f"Bearer {token}"}
