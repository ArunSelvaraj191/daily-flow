
from fastapi import APIRouter, Depends, Query, status

from app.db.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.common import MessageResponse
from app.schemas.habit import (
    HabitCreateRequest,
    HabitLogRequest,
    HabitLogResponse,
    HabitResponse,
    HabitUpdateRequest,
)
from app.services.habit_service import HabitService

router = APIRouter(prefix="/habits", tags=["Habits"])


@router.get("", response_model=list[HabitResponse])
async def list_habits(
    activeOnly: bool = Query(False),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = HabitService(db)
    return await service.list_habits(current_user["id"], active_only=activeOnly)


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    req: HabitCreateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = HabitService(db)
    return await service.create_habit(current_user["id"], req)


@router.patch("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    req: HabitUpdateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = HabitService(db)
    return await service.update_habit(current_user["id"], habit_id, req)


@router.delete("/{habit_id}", response_model=MessageResponse)
async def delete_habit(
    habit_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = HabitService(db)
    await service.delete_habit(current_user["id"], habit_id)
    return {"message": "Habit deleted successfully", "success": True}


@router.post("/{habit_id}/logs", response_model=HabitLogResponse)
async def log_habit_completion(
    habit_id: str,
    req: HabitLogRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = HabitService(db)
    return await service.log_habit(current_user["id"], habit_id, req)


@router.get("/{habit_id}/history", response_model=list[HabitLogResponse])
async def get_habit_history(
    habit_id: str,
    startDate: str | None = Query(None),
    endDate: str | None = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = HabitService(db)
    return await service.get_habit_history(current_user["id"], habit_id, startDate, endDate)
