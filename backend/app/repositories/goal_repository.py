from datetime import UTC, date, datetime, timedelta
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.base import document_to_dict, documents_to_list, to_object_id


class GoalRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.goals
        self.activities_collection = db.activities
        self.habit_logs_collection = db.habit_logs

    async def get_by_id(self, user_id: str, goal_id: str) -> dict[str, Any] | None:
        try:
            doc = await self.collection.find_one({
                "_id": to_object_id(goal_id),
                "userId": user_id
            })
            if not doc:
                return None
            goal = document_to_dict(doc)
            return await self._enrich_goal_progress(user_id, goal)
        except Exception:
            return None

    async def list_goals(self, user_id: str, status: str | None = None) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"userId": user_id}
        if status:
            query["status"] = status
        cursor = self.collection.find(query).sort("createdAt", -1)
        raw_goals = await cursor.to_list(length=100)
        goals = documents_to_list(raw_goals)
        enriched = []
        for g in goals:
            enriched_g = await self._enrich_goal_progress(user_id, g)
            enriched.append(enriched_g)
        return enriched

    async def create(self, user_id: str, data: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(UTC)
        data["userId"] = user_id
        data["createdAt"] = now
        data["updatedAt"] = now
        res = await self.collection.insert_one(data)
        data["_id"] = res.inserted_id
        goal = document_to_dict(data)
        return await self._enrich_goal_progress(user_id, goal)

    async def update(self, user_id: str, goal_id: str, update_data: dict[str, Any]) -> dict[str, Any] | None:
        update_data["updatedAt"] = datetime.now(UTC)
        res = await self.collection.find_one_and_update(
            {"_id": to_object_id(goal_id), "userId": user_id},
            {"$set": update_data},
            return_document=True
        )
        if not res:
            return None
        goal = document_to_dict(res)
        return await self._enrich_goal_progress(user_id, goal)

    async def delete(self, user_id: str, goal_id: str) -> bool:
        res = await self.collection.delete_one({
            "_id": to_object_id(goal_id),
            "userId": user_id
        })
        return res.deleted_count > 0

    async def _enrich_goal_progress(self, user_id: str, goal: dict[str, Any]) -> dict[str, Any]:
        today = date.today()
        period = goal.get("measurementPeriod", "weekly")
        metric = goal.get("metricType", "duration_minutes")
        target = float(goal.get("targetValue", 1.0))
        end_date_str = goal.get("endDate")

        # Determine date range
        if period == "daily":
            start_range = today.isoformat()
            end_range = today.isoformat()
        elif period == "weekly":
            # Monday of this week
            start_of_week = today - timedelta(days=today.weekday())
            start_range = start_of_week.isoformat()
            end_range = today.isoformat()
        else:  # monthly
            first_of_month = today.replace(day=1)
            start_range = first_of_month.isoformat()
            end_range = today.isoformat()

        # If goal startDate is later than start_range, use goal startDate
        if goal.get("startDate") and goal["startDate"] > start_range:
            start_range = goal["startDate"]

        current_value = 0.0
        if metric == "duration_minutes":
            q: dict[str, Any] = {
                "userId": user_id,
                "activityDate": {"$gte": start_range, "$lte": end_range}
            }
            if goal.get("category") and goal["category"] != "General":
                q["category"] = goal["category"]
            pipeline = [
                {"$match": q},
                {"$group": {"_id": None, "total": {"$sum": "$actualDuration"}}}
            ]
            res = await self.activities_collection.aggregate(pipeline).to_list(length=1)
            if res:
                current_value = float(res[0].get("total", 0.0))

        elif metric == "activity_count":
            q = {
                "userId": user_id,
                "status": "Completed",
                "activityDate": {"$gte": start_range, "$lte": end_range}
            }
            if goal.get("category") and goal["category"] != "General":
                q["category"] = goal["category"]
            current_value = float(await self.activities_collection.count_documents(q))

        elif metric == "habit_count":
            q = {
                "userId": user_id,
                "completed": True,
                "date": {"$gte": start_range, "$lte": end_range}
            }
            current_value = float(await self.habit_logs_collection.count_documents(q))

        pct = round(min(100.0, (current_value / target * 100.0)), 1) if target > 0 else 0.0
        is_overdue = False
        if end_date_str:
            try:
                end_date = date.fromisoformat(end_date_str)
                is_overdue = (today > end_date) and (current_value < target)
            except Exception:
                pass

        goal["currentValue"] = current_value
        goal["progressPercentage"] = pct
        goal["isOverdue"] = is_overdue
        if pct >= 100.0 and goal.get("status") == "active":
            goal["status"] = "completed"
        return goal
