from datetime import UTC, datetime
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.base import document_to_dict, to_object_id


class UserRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.users

    async def get_by_id(self, user_id: str) -> dict[str, Any] | None:
        try:
            doc = await self.collection.find_one({"_id": to_object_id(user_id)})
            return document_to_dict(doc)
        except Exception:
            return None

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        doc = await self.collection.find_one({"email": email.lower().strip()})
        return document_to_dict(doc)

    async def create(self, user_data: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(UTC)
        user_data["email"] = user_data["email"].lower().strip()
        user_data["createdAt"] = now
        user_data["updatedAt"] = now
        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return document_to_dict(user_data)

    async def update(self, user_id: str, update_data: dict[str, Any]) -> dict[str, Any] | None:
        update_data["updatedAt"] = datetime.now(UTC)
        result = await self.collection.find_one_and_update(
            {"_id": to_object_id(user_id)},
            {"$set": update_data},
            return_document=True
        )
        return document_to_dict(result)
