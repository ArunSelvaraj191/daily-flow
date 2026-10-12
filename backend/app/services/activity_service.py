from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import NotFoundException
from app.repositories.activity_repository import ActivityRepository
from app.schemas.activity import ActivityCreateRequest, ActivityStatus, ActivityUpdateRequest


class ActivityService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = ActivityRepository(db)

    async def create_activity(self, user_id: str, req: ActivityCreateRequest) -> dict[str, Any]:
        data = req.model_dump()
        # Calculate plannedDuration if start and end times provided and not manually set
        if req.plannedStartTime and req.plannedEndTime and req.plannedDuration == 30:
            try:
                sh, sm = map(int, req.plannedStartTime.split(":"))
                eh, em = map(int, req.plannedEndTime.split(":"))
                diff = (eh * 60 + em) - (sh * 60 + sm)
                if diff > 0:
                    data["plannedDuration"] = diff
            except Exception:
                pass
        return await self.repo.create(user_id, data)

    async def get_activity(self, user_id: str, activity_id: str) -> dict[str, Any]:
        activity = await self.repo.get_by_id(user_id, activity_id)
        if not activity:
            raise NotFoundException("Activity", activity_id)
        return activity

    async def update_activity(self, user_id: str, activity_id: str, req: ActivityUpdateRequest) -> dict[str, Any]:
        await self.get_activity(user_id, activity_id)
        update_data = req.model_dump(exclude_unset=True)
        # Preserve actualDuration if not explicitly provided
        if "actualDuration" not in update_data:
            update_data.pop("actualDuration", None)
        updated = await self.repo.update(user_id, activity_id, update_data)
        return updated

    async def delete_activity(self, user_id: str, activity_id: str) -> bool:
        await self.get_activity(user_id, activity_id)
        return await self.repo.delete(user_id, activity_id)

    async def toggle_complete(self, user_id: str, activity_id: str) -> dict[str, Any]:
        existing = await self.get_activity(user_id, activity_id)
        new_status = (
            ActivityStatus.PENDING.value
            if existing.get("status") == ActivityStatus.COMPLETED.value
            else ActivityStatus.COMPLETED.value
        )
        updated = await self.repo.update(user_id, activity_id, {"status": new_status})
        return updated

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
        return await self.repo.list_activities(
            user_id=user_id,
            date=date,
            start_date=start_date,
            end_date=end_date,
            category=category,
            status=status,
            priority=priority,
            search=search,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order
        )
