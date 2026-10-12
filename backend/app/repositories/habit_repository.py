from datetime import UTC, date, datetime, timedelta
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.base import document_to_dict, documents_to_list, to_object_id


class HabitRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.habits
        self.logs_collection = db.habit_logs

    async def get_by_id(self, user_id: str, habit_id: str) -> dict[str, Any] | None:
        try:
            doc = await self.collection.find_one({
                "_id": to_object_id(habit_id),
                "userId": user_id
            })
            if not doc:
                return None
            habit = document_to_dict(doc)
            return await self._enrich_habit_streaks(user_id, habit)
        except Exception:
            return None

    async def list_habits(self, user_id: str, active_only: bool = False) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"userId": user_id}
        if active_only:
            query["isActive"] = True
        cursor = self.collection.find(query).sort("createdAt", -1)
        raw_habits = await cursor.to_list(length=100)
        habits = documents_to_list(raw_habits)
        
        # Enrich all with streaks
        enriched = []
        for h in habits:
            enriched_h = await self._enrich_habit_streaks(user_id, h)
            enriched.append(enriched_h)
        return enriched

    async def create(self, user_id: str, data: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(UTC)
        data["userId"] = user_id
        data["createdAt"] = now
        data["updatedAt"] = now
        res = await self.collection.insert_one(data)
        data["_id"] = res.inserted_id
        habit = document_to_dict(data)
        return await self._enrich_habit_streaks(user_id, habit)

    async def update(self, user_id: str, habit_id: str, update_data: dict[str, Any]) -> dict[str, Any] | None:
        update_data["updatedAt"] = datetime.now(UTC)
        res = await self.collection.find_one_and_update(
            {"_id": to_object_id(habit_id), "userId": user_id},
            {"$set": update_data},
            return_document=True
        )
        if not res:
            return None
        habit = document_to_dict(res)
        return await self._enrich_habit_streaks(user_id, habit)

    async def delete(self, user_id: str, habit_id: str) -> bool:
        # Note: preserve historical logs or soft-delete habit
        res = await self.collection.delete_one({
            "_id": to_object_id(habit_id),
            "userId": user_id
        })
        return res.deleted_count > 0

    async def log_completion(
        self,
        user_id: str,
        habit_id: str,
        log_date: str,
        completed: bool = True,
        duration_minutes: int = 0,
        notes: str = ""
    ) -> dict[str, Any]:
        now = datetime.now(UTC)
        log_doc = {
            "userId": user_id,
            "habitId": habit_id,
            "date": log_date,
            "completed": completed,
            "durationMinutes": duration_minutes,
            "notes": notes,
            "updatedAt": now
        }
        res = await self.logs_collection.find_one_and_update(
            {"userId": user_id, "habitId": habit_id, "date": log_date},
            {"$set": log_doc, "$setOnInsert": {"createdAt": now}},
            upsert=True,
            return_document=True
        )
        return document_to_dict(res)

    async def get_habit_logs(
        self,
        user_id: str,
        habit_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"userId": user_id, "habitId": habit_id}
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            query["date"] = date_filter
        cursor = self.logs_collection.find(query).sort("date", -1)
        items = await cursor.to_list(length=365)
        return documents_to_list(items)

    async def _enrich_habit_streaks(self, user_id: str, habit: dict[str, Any]) -> dict[str, Any]:
        habit_id = habit["id"]
        today_str = date.today().isoformat()
        
        # Get all completed logs for this habit sorted by date asc
        cursor = self.logs_collection.find({
            "userId": user_id,
            "habitId": habit_id,
            "completed": True
        }).sort("date", 1)
        logs = await cursor.to_list(length=1000)
        completed_dates = {log["date"] for log in logs}

        habit["completedToday"] = today_str in completed_dates

        # Calculate weekly completion rate for past 7 days
        today = date.today()
        past_7_days = [(today - timedelta(days=i)).isoformat() for i in range(7)]
        completed_past_7 = sum(1 for d in past_7_days if d in completed_dates)
        habit["weeklyCompletionRate"] = round((completed_past_7 / 7.0) * 100, 1)

        # Calculate current streak and longest streak
        current_streak = 0
        longest_streak = 0
        temp_streak = 0

        # Sort dates as objects
        date_objs = sorted([date.fromisoformat(d) for d in completed_dates])
        
        if date_objs:
            # Longest streak calculation
            prev_d = None
            for d in date_objs:
                if prev_d is None:
                    temp_streak = 1
                elif (d - prev_d).days == 1:
                    temp_streak += 1
                elif (d - prev_d).days > 1:
                    temp_streak = 1
                longest_streak = max(longest_streak, temp_streak)
                prev_d = d

            # Current streak calculation
            # Check backwards starting from today or yesterday
            check_date = today if today_str in completed_dates else today - timedelta(days=1)
            while check_date.isoformat() in completed_dates:
                current_streak += 1
                check_date -= timedelta(days=1)

        habit["currentStreak"] = current_streak
        habit["longestStreak"] = max(longest_streak, current_streak)
        return habit
