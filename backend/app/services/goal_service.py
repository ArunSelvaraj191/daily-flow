from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import NotFoundException
from app.repositories.goal_repository import GoalRepository
from app.schemas.goal import GoalCreateRequest, GoalUpdateRequest


class GoalService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = GoalRepository(db)

    async def list_goals(self, user_id: str, status: str | None = None) -> list[dict[str, Any]]:
        return await self.repo.list_goals(user_id, status)

    async def get_goal(self, user_id: str, goal_id: str) -> dict[str, Any]:
        goal = await self.repo.get_by_id(user_id, goal_id)
        if not goal:
            raise NotFoundException("Goal", goal_id)
        return goal

    async def create_goal(self, user_id: str, req: GoalCreateRequest) -> dict[str, Any]:
        return await self.repo.create(user_id, req.model_dump())

    async def update_goal(self, user_id: str, goal_id: str, req: GoalUpdateRequest) -> dict[str, Any]:
        await self.get_goal(user_id, goal_id)
        updated = await self.repo.update(user_id, goal_id, req.model_dump(exclude_unset=True))
        return updated

    async def delete_goal(self, user_id: str, goal_id: str) -> bool:
        await self.get_goal(user_id, goal_id)
        return await self.repo.delete(user_id, goal_id)
