
from fastapi import APIRouter, Depends, Query

from app.db.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.repositories.activity_repository import ActivityRepository
from app.schemas.activity import ActivityResponse

router = APIRouter(prefix="/calendar", tags=["Calendar"])


@router.get("/activities", response_model=list[ActivityResponse])
async def get_calendar_activities(
    startDate: str = Query(..., description="Start date (YYYY-MM-DD)"),
    endDate: str = Query(..., description="End date (YYYY-MM-DD)"),
    category: str | None = Query(None),
    status: str | None = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    repo = ActivityRepository(db)
    return await repo.get_all_by_range(
        user_id=current_user["id"],
        start_date=startDate,
        end_date=endDate,
        category=category,
        status=status
    )
