
from fastapi import APIRouter, Depends, Query

from app.db.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.dashboard import (
    ActivityTrendPoint,
    CategoryDistributionItem,
    DashboardSummaryResponse,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_summary(
    preset: str | None = Query("this_week", description="today, yesterday, this_week, this_month, custom"),
    startDate: str | None = Query(None),
    endDate: str | None = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = DashboardService(db)
    return await service.get_summary(
        user_id=current_user["id"],
        preset=preset,
        start_date=startDate,
        end_date=endDate
    )


@router.get("/activity-trends", response_model=list[ActivityTrendPoint])
async def get_activity_trends(
    days: int = Query(7, ge=3, le=90),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = DashboardService(db)
    return await service.get_activity_trends(current_user["id"], days=days)


@router.get("/time-distribution", response_model=list[CategoryDistributionItem])
async def get_time_distribution(
    preset: str | None = Query("this_week"),
    startDate: str | None = Query(None),
    endDate: str | None = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = DashboardService(db)
    return await service.get_time_distribution(
        user_id=current_user["id"],
        preset=preset,
        start_date=startDate,
        end_date=endDate
    )
