from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING

from app.core.logging import logger


async def create_db_indexes(db: AsyncIOMotorDatabase):
    logger.info("Ensuring database indexes...")
    try:
        # 1. users: unique index on email
        await db.users.create_index([("email", ASCENDING)], unique=True)

        # 2. activities
        await db.activities.create_index([("userId", ASCENDING), ("activityDate", DESCENDING)])
        await db.activities.create_index([("userId", ASCENDING), ("status", ASCENDING)])
        await db.activities.create_index([("userId", ASCENDING), ("category", ASCENDING)])
        await db.activities.create_index([("userId", ASCENDING), ("priority", ASCENDING)])
        await db.activities.create_index([("userId", ASCENDING), ("createdAt", DESCENDING)])

        # 3. timer_sessions
        await db.timer_sessions.create_index([("userId", ASCENDING), ("status", ASCENDING)])
        await db.timer_sessions.create_index([("userId", ASCENDING), ("activityId", ASCENDING)])
        await db.timer_sessions.create_index([("userId", ASCENDING), ("startedAt", DESCENDING)])

        # 4. habits
        await db.habits.create_index([("userId", ASCENDING), ("isActive", ASCENDING)])
        await db.habits.create_index([("userId", ASCENDING), ("category", ASCENDING)])

        # 5. habit_logs: unique index on (userId, habitId, date)
        await db.habit_logs.create_index(
            [("userId", ASCENDING), ("habitId", ASCENDING), ("date", ASCENDING)],
            unique=True
        )
        await db.habit_logs.create_index([("userId", ASCENDING), ("date", DESCENDING)])

        # 6. goals
        await db.goals.create_index([("userId", ASCENDING), ("status", ASCENDING)])
        await db.goals.create_index([("userId", ASCENDING), ("category", ASCENDING)])

        logger.info("Successfully created/verified all database indexes.")
    except Exception as e:
        logger.warning(f"Notice while creating indexes (may already exist or index mismatch): {e}")
