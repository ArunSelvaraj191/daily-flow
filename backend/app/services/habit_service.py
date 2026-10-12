from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import NotFoundException
from app.repositories.habit_repository import HabitRepository
from app.schemas.habit import HabitCreateRequest, HabitLogRequest, HabitUpdateRequest


class HabitService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = HabitRepository(db)

    async def list_habits(self, user_id: str, active_only: bool = False) -> list[dict[str, Any]]:
        return await self.repo.list_habits(user_id, active_only)

    async def get_habit(self, user_id: str, habit_id: str) -> dict[str, Any]:
        habit = await self.repo.get_by_id(user_id, habit_id)
        if not habit:
            raise NotFoundException("Habit", habit_id)
        return habit

    async def create_habit(self, user_id: str, req: HabitCreateRequest) -> dict[str, Any]:
        return await self.repo.create(user_id, req.model_dump())

    async def update_habit(self, user_id: str, habit_id: str, req: HabitUpdateRequest) -> dict[str, Any]:
        await self.get_habit(user_id, habit_id)
        updated = await self.repo.update(user_id, habit_id, req.model_dump(exclude_unset=True))
        return updated

    async def delete_habit(self, user_id: str, habit_id: str) -> bool:
        await self.get_habit(user_id, habit_id)
        return await self.repo.delete(user_id, habit_id)

    async def log_habit(self, user_id: str, habit_id: str, req: HabitLogRequest) -> dict[str, Any]:
        await self.get_habit(user_id, habit_id)
        log = await self.repo.log_completion(
            user_id=user_id,
            habit_id=habit_id,
            log_date=req.date,
            completed=req.completed,
            duration_minutes=req.durationMinutes,
            notes=req.notes or ""
        )
        return log

    async def get_habit_history(
        self,
        user_id: str,
        habit_id: str,
        start_date: str | None = None,
        end_date: str | None = None
    ) -> list[dict[str, Any]]:
        await self.get_habit(user_id, habit_id)
        return await self.repo.get_habit_logs(user_id, habit_id, start_date, end_date)
