from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import BadRequestException, NotFoundException
from app.repositories.activity_repository import ActivityRepository
from app.repositories.timer_repository import TimerRepository
from app.schemas.timer import TimerStartRequest


class TimerService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = TimerRepository(db)
        self.activity_repo = ActivityRepository(db)

    async def get_active_session(self, user_id: str) -> dict[str, Any]:
        session = await self.repo.get_active_session(user_id)
        if session:
            return {"hasActiveTimer": True, "session": session}
        return {"hasActiveTimer": False, "session": None}

    async def start_timer(self, user_id: str, req: TimerStartRequest) -> dict[str, Any]:
        # Validate that activity exists and belongs to user
        activity = await self.activity_repo.get_by_id(user_id, req.activityId)
        if not activity:
            raise NotFoundException("Activity", req.activityId)

        # Check for existing active session
        existing_active = await self.repo.get_active_session(user_id)
        if existing_active:
            # If already running/paused on this same activity, return it
            if existing_active.get("activityId") == req.activityId:
                if existing_active.get("status") == "paused":
                    # Auto-resume
                    resumed = await self.repo.resume_session(user_id, existing_active["id"])
                    resumed["activityTitle"] = activity.get("title", "")
                    return resumed
                return existing_active
            else:
                # Stop the previous active session before starting a new one
                await self.repo.stop_session(user_id, existing_active["id"])

        # Update activity status to 'In Progress' if currently 'Pending'
        if activity.get("status") == "Pending":
            await self.activity_repo.update(user_id, req.activityId, {"status": "In Progress"})

        new_session = await self.repo.create_session(user_id, req.activityId)
        new_session["activityTitle"] = activity.get("title", "")
        return new_session

    async def pause_timer(self, user_id: str, session_id: str) -> dict[str, Any]:
        session = await self.repo.get_by_id(user_id, session_id)
        if not session:
            raise NotFoundException("Timer session", session_id)
        if session.get("status") != "running":
            raise BadRequestException(f"Cannot pause timer in state '{session.get('status')}'.")

        updated = await self.repo.pause_session(user_id, session_id)
        if not updated:
            raise BadRequestException("Failed to pause timer session.")
        return updated

    async def resume_timer(self, user_id: str, session_id: str) -> dict[str, Any]:
        session = await self.repo.get_by_id(user_id, session_id)
        if not session:
            raise NotFoundException("Timer session", session_id)
        if session.get("status") != "paused":
            raise BadRequestException(f"Cannot resume timer in state '{session.get('status')}'.")

        updated = await self.repo.resume_session(user_id, session_id)
        if not updated:
            raise BadRequestException("Failed to resume timer session.")
        return updated

    async def stop_timer(self, user_id: str, session_id: str) -> dict[str, Any]:
        session = await self.repo.get_by_id(user_id, session_id)
        if not session:
            raise NotFoundException("Timer session", session_id)
        if session.get("status") == "stopped":
            raise BadRequestException("Timer session is already stopped.")

        updated = await self.repo.stop_session(user_id, session_id)
        if not updated:
            raise BadRequestException("Failed to stop timer session.")
        return updated
