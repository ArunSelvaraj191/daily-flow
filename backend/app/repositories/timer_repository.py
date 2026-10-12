from datetime import UTC, datetime
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.base import document_to_dict, to_object_id


class TimerRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.timer_sessions
        self.activities_collection = db.activities

    async def get_active_session(self, user_id: str) -> dict[str, Any] | None:
        doc = await self.collection.find_one({
            "userId": user_id,
            "status": {"$in": ["running", "paused"]}
        })
        if not doc:
            return None
        session = document_to_dict(doc)
        # Compute live elapsed seconds
        session["currentElapsedSeconds"] = self._compute_elapsed_seconds(session)
        # Populate activity title
        if session.get("activityId"):
            try:
                act = await self.activities_collection.find_one(
                    {"_id": to_object_id(session["activityId"])},
                    {"title": 1}
                )
                if act:
                    session["activityTitle"] = act.get("title", "")
            except Exception:
                session["activityTitle"] = ""
        return session

    async def get_by_id(self, user_id: str, session_id: str) -> dict[str, Any] | None:
        try:
            doc = await self.collection.find_one({
                "_id": to_object_id(session_id),
                "userId": user_id
            })
            if not doc:
                return None
            session = document_to_dict(doc)
            session["currentElapsedSeconds"] = self._compute_elapsed_seconds(session)
            return session
        except Exception:
            return None

    def _compute_elapsed_seconds(self, session: dict[str, Any]) -> int:
        accumulated = session.get("accumulatedSeconds", 0)
        status = session.get("status")
        if status == "running" and session.get("startedAt"):
            started = session["startedAt"]
            if isinstance(started, str):
                started = datetime.fromisoformat(started)
            if started.tzinfo is None:
                started = started.replace(tzinfo=UTC)
            now = datetime.now(UTC)
            diff = int((now - started).total_seconds())
            if diff > 0:
                return accumulated + diff
        return accumulated

    async def create_session(self, user_id: str, activity_id: str) -> dict[str, Any]:
        now = datetime.now(UTC)
        doc = {
            "userId": user_id,
            "activityId": activity_id,
            "status": "running",
            "startedAt": now,
            "pausedAt": None,
            "stoppedAt": None,
            "accumulatedSeconds": 0,
            "segments": [
                {
                    "startTime": now,
                    "endTime": None,
                    "durationSeconds": 0
                }
            ],
            "createdAt": now,
            "updatedAt": now
        }
        res = await self.collection.insert_one(doc)
        doc["_id"] = res.inserted_id
        session = document_to_dict(doc)
        session["currentElapsedSeconds"] = 0
        return session

    async def pause_session(self, user_id: str, session_id: str) -> dict[str, Any] | None:
        now = datetime.now(UTC)
        session = await self.get_by_id(user_id, session_id)
        if not session or session.get("status") != "running":
            return None

        started_at = session.get("startedAt")
        if isinstance(started_at, str):
            started_at = datetime.fromisoformat(started_at)
        if started_at.tzinfo is None:
            started_at = started_at.replace(tzinfo=UTC)
        diff = max(0, int((now - started_at).total_seconds()))
        new_accumulated = session.get("accumulatedSeconds", 0) + diff

        res = await self.collection.find_one_and_update(
            {"_id": to_object_id(session_id), "userId": user_id, "status": "running"},
            {
                "$set": {
                    "status": "paused",
                    "pausedAt": now,
                    "accumulatedSeconds": new_accumulated,
                    "updatedAt": now
                }
            },
            return_document=True
        )
        if not res:
            return None
        result_dict = document_to_dict(res)
        result_dict["currentElapsedSeconds"] = new_accumulated
        return result_dict

    async def resume_session(self, user_id: str, session_id: str) -> dict[str, Any] | None:
        now = datetime.now(UTC)
        res = await self.collection.find_one_and_update(
            {"_id": to_object_id(session_id), "userId": user_id, "status": "paused"},
            {
                "$set": {
                    "status": "running",
                    "startedAt": now,
                    "pausedAt": None,
                    "updatedAt": now
                }
            },
            return_document=True
        )
        if not res:
            return None
        result_dict = document_to_dict(res)
        result_dict["currentElapsedSeconds"] = result_dict.get("accumulatedSeconds", 0)
        return result_dict

    async def stop_session(self, user_id: str, session_id: str) -> dict[str, Any] | None:
        now = datetime.now(UTC)
        session = await self.get_by_id(user_id, session_id)
        if not session or session.get("status") == "stopped":
            return None

        total_seconds = session.get("accumulatedSeconds", 0)
        if session.get("status") == "running" and session.get("startedAt"):
            started_at = session.get("startedAt")
            if isinstance(started_at, str):
                started_at = datetime.fromisoformat(started_at)
            if started_at.tzinfo is None:
                started_at = started_at.replace(tzinfo=UTC)
            total_seconds += max(0, int((now - started_at).total_seconds()))

        res = await self.collection.find_one_and_update(
            {"_id": to_object_id(session_id), "userId": user_id},
            {
                "$set": {
                    "status": "stopped",
                    "stoppedAt": now,
                    "accumulatedSeconds": total_seconds,
                    "updatedAt": now
                }
            },
            return_document=True
        )
        if not res:
            return None

        # Add tracked minutes to activity
        activity_id = session.get("activityId")
        if activity_id:
            minutes_to_add = max(1, int(round(total_seconds / 60.0))) if total_seconds >= 30 else 0
            if minutes_to_add > 0:
                try:
                    await self.activities_collection.update_one(
                        {"_id": to_object_id(activity_id), "userId": user_id},
                        {
                            "$inc": {"actualDuration": minutes_to_add},
                            "$set": {"updatedAt": now}
                        }
                    )
                except Exception:
                    pass

        result_dict = document_to_dict(res)
        result_dict["currentElapsedSeconds"] = total_seconds
        return result_dict
