
from fastapi import APIRouter, Depends, Query, status

from app.db.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.common import MessageResponse
from app.schemas.goal import GoalCreateRequest, GoalResponse, GoalUpdateRequest
from app.services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("", response_model=list[GoalResponse])
async def list_goals(
    status: str | None = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = GoalService(db)
    return await service.list_goals(current_user["id"], status)


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    req: GoalCreateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = GoalService(db)
    return await service.create_goal(current_user["id"], req)


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = GoalService(db)
    return await service.get_goal(current_user["id"], goal_id)


@router.patch("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    req: GoalUpdateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = GoalService(db)
    return await service.update_goal(current_user["id"], goal_id, req)


@router.delete("/{goal_id}", response_model=MessageResponse)
async def delete_goal(
    goal_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = GoalService(db)
    await service.delete_goal(current_user["id"], goal_id)
    return {"message": "Goal deleted successfully", "success": True}
