from datetime import UTC, datetime
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING

from app.repositories.base import document_to_dict, documents_to_list, to_object_id


class ActivityRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.activities

    async def get_by_id(self, user_id: str, activity_id: str) -> dict[str, Any] | None:
        try:
            doc = await self.collection.find_one({
                "_id": to_object_id(activity_id),
                "userId": user_id
            })
            return document_to_dict(doc)
        except Exception:
            return None

    async def create(self, user_id: str, data: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(UTC)
        data["userId"] = user_id
        data["createdAt"] = now
        data["updatedAt"] = now
        result = await self.collection.insert_one(data)
        data["_id"] = result.inserted_id
        return document_to_dict(data)

    async def update(self, user_id: str, activity_id: str, update_data: dict[str, Any]) -> dict[str, Any] | None:
        update_data["updatedAt"] = datetime.now(UTC)
        result = await self.collection.find_one_and_update(
            {"_id": to_object_id(activity_id), "userId": user_id},
            {"$set": update_data},
            return_document=True
        )
        return document_to_dict(result)

    async def delete(self, user_id: str, activity_id: str) -> bool:
        result = await self.collection.delete_one({
            "_id": to_object_id(activity_id),
            "userId": user_id
        })
        return result.deleted_count > 0

    async def list_activities(
        self,
        user_id: str,
        date: str | None = None,
        start_date: str | None = None,
        end_date: str | None = None,
        category: str | None = None,
        status: str | None = None,
        priority: str | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "activityDate",
        sort_order: str = "desc"
    ) -> tuple[list[dict[str, Any]], int]:
        query: dict[str, Any] = {"userId": user_id}

        if date:
            query["activityDate"] = date
        elif start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            query["activityDate"] = date_filter

        if category:
            query["category"] = category
        if status:
            query["status"] = status
        if priority:
            query["priority"] = priority

        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"tags": {"$in": [search]}}
            ]

        total = await self.collection.count_documents(query)
        direction = DESCENDING if sort_order.lower() == "desc" else ASCENDING

        cursor = self.collection.find(query).sort(sort_by, direction).skip((page - 1) * page_size).limit(page_size)
        items = await cursor.to_list(length=page_size)
        return documents_to_list(items), total

    async def get_all_by_range(
        self,
        user_id: str,
        start_date: str,
        end_date: str,
        category: str | None = None,
        status: str | None = None
    ) -> list[dict[str, Any]]:
        query: dict[str, Any] = {
            "userId": user_id,
            "activityDate": {"$gte": start_date, "$lte": end_date}
        }
        if category:
            query["category"] = category
        if status:
            query["status"] = status
        cursor = self.collection.find(query).sort("activityDate", ASCENDING)
        items = await cursor.to_list(length=1000)
        return documents_to_list(items)

    async def aggregate_dashboard_summary(
        self,
        user_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> dict[str, Any]:
        match_stage: dict[str, Any] = {"userId": user_id}
        if start_date and end_date:
            match_stage["activityDate"] = {"$gte": start_date, "$lte": end_date}
        elif start_date:
            match_stage["activityDate"] = start_date

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": None,
                    "totalActivities": {"$sum": 1},
                    "completedActivities": {
                        "$sum": {"$cond": [{"$eq": ["$status", "Completed"]}, 1, 0]}
                    },
                    "pendingActivities": {
                        "$sum": {"$cond": [{"$eq": ["$status", "Pending"]}, 1, 0]}
                    },
                    "inProgressActivities": {
                        "$sum": {"$cond": [{"$eq": ["$status", "In Progress"]}, 1, 0]}
                    },
                    "totalTrackedMinutes": {"$sum": "$actualDuration"},
                    "plannedTimeMinutes": {"$sum": "$plannedDuration"}
                }
            }
        ]
        result = await self.collection.aggregate(pipeline).to_list(length=1)
        if result:
            row = result[0]
            total = row.get("totalActivities", 0)
            completed = row.get("completedActivities", 0)
            rate = round((completed / total * 100), 1) if total > 0 else 0.0
            return {
                "totalActivities": total,
                "completedActivities": completed,
                "pendingActivities": row.get("pendingActivities", 0),
                "inProgressActivities": row.get("inProgressActivities", 0),
                "completionRate": rate,
                "totalTimeTrackedMinutes": row.get("totalTrackedMinutes", 0),
                "productiveHours": round(row.get("totalTrackedMinutes", 0) / 60.0, 1),
                "plannedTimeMinutes": row.get("plannedTimeMinutes", 0)
            }
        return {
            "totalActivities": 0,
            "completedActivities": 0,
            "pendingActivities": 0,
            "inProgressActivities": 0,
            "completionRate": 0.0,
            "totalTimeTrackedMinutes": 0,
            "productiveHours": 0.0,
            "plannedTimeMinutes": 0
        }

    async def aggregate_category_distribution(
        self,
        user_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> list[dict[str, Any]]:
        match_stage: dict[str, Any] = {"userId": user_id}
        if start_date and end_date:
            match_stage["activityDate"] = {"$gte": start_date, "$lte": end_date}
        elif start_date:
            match_stage["activityDate"] = start_date

        pipeline = [
            {"$match": match_stage},
            {
                "$group": {
                    "_id": "$category",
                    "minutes": {"$sum": "$actualDuration"},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"minutes": -1}}
        ]
        items = await self.collection.aggregate(pipeline).to_list(length=100)
        total_minutes = sum(item.get("minutes", 0) for item in items)

        distribution = []
        for item in items:
            minutes = item.get("minutes", 0)
            pct = round((minutes / total_minutes * 100), 1) if total_minutes > 0 else 0.0
            distribution.append({
                "category": item.get("_id") or "Other",
                "minutes": minutes,
                "hours": round(minutes / 60.0, 1),
                "percentage": pct,
                "activityCount": item.get("count", 0)
            })
        return distribution
