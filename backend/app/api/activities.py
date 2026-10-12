
from fastapi import APIRouter, Depends, Query, status

from app.db.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.activity import ActivityCreateRequest, ActivityResponse, ActivityUpdateRequest
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get("", response_model=PaginatedResponse[ActivityResponse])
async def list_activities(
    date: str | None = Query(None, description="Filter by YYYY-MM-DD"),
    startDate: str | None = Query(None, description="Start date range"),
    endDate: str | None = Query(None, description="End date range"),
    category: str | None = Query(None, description="Filter by category"),
    status: str | None = Query(None, description="Filter by status"),
    priority: str | None = Query(None, description="Filter by priority"),
    search: str | None = Query(None, description="Search keyword"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    sortBy: str = Query("activityDate"),
    sortOrder: str = Query("desc"),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ActivityService(db)
    items, total = await service.list_activities(
        user_id=current_user["id"],
        date=date,
        start_date=startDate,
        end_date=endDate,
        category=category,
        status=status,
        priority=priority,
        search=search,
        page=page,
        page_size=pageSize,
        sort_by=sortBy,
        sort_order=sortOrder
    )
    total_pages = (total + pageSize - 1) // pageSize if total > 0 else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": pageSize,
        "total_pages": total_pages
    }


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(
    req: ActivityCreateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ActivityService(db)
    return await service.create_activity(current_user["id"], req)


@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ActivityService(db)
    return await service.get_activity(current_user["id"], activity_id)


@router.patch("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: str,
    req: ActivityUpdateRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ActivityService(db)
    return await service.update_activity(current_user["id"], activity_id, req)


@router.delete("/{activity_id}", response_model=MessageResponse)
async def delete_activity(
    activity_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ActivityService(db)
    await service.delete_activity(current_user["id"], activity_id)
    return {"message": "Activity deleted successfully", "success": True}


@router.post("/{activity_id}/complete", response_model=ActivityResponse)
async def toggle_activity_complete(
    activity_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ActivityService(db)
    return await service.toggle_complete(current_user["id"], activity_id)
