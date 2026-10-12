
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings
from app.core.logging import logger


class MongoDB:
    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None


mongodb = MongoDB()


async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    mongodb.client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=5000,
        maxPoolSize=50,
        minPoolSize=10
    )
    mongodb.db = mongodb.client[settings.MONGODB_DATABASE]
    # Ping to verify
    await mongodb.client.admin.command('ping')
    logger.info(f"Successfully connected to MongoDB database: {settings.MONGODB_DATABASE}")


async def close_mongo_connection():
    if mongodb.client:
        logger.info("Closing MongoDB connection...")
        mongodb.client.close()
        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    if mongodb.db is None:
        raise RuntimeError("MongoDB is not initialized. Call connect_to_mongo first.")
    return mongodb.db
