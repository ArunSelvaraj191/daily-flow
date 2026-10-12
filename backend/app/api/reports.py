
from fastapi import APIRouter, Depends, Query, Response

from app.db.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.report import (
    AIInsightResponse,
    DailyReportResponse,
    MonthlyReportResponse,
    WeeklyReportResponse,
)
from app.services.ai_service import AIService
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/daily", response_model=DailyReportResponse)
async def get_daily_report(
    date: str | None = Query(None, description="Date YYYY-MM-DD"),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ReportService(db)
    return await service.get_daily_report(current_user["id"], date)


@router.get("/weekly", response_model=WeeklyReportResponse)
async def get_weekly_report(
    startDate: str | None = Query(None),
    endDate: str | None = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ReportService(db)
    return await service.get_weekly_report(current_user["id"], startDate, endDate)


@router.get("/monthly", response_model=MonthlyReportResponse)
async def get_monthly_report(
    month: str | None = Query(None, description="Month YYYY-MM"),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ReportService(db)
    return await service.get_monthly_report(current_user["id"], month)


@router.get("/export.csv")
async def export_csv(
    startDate: str | None = Query(None),
    endDate: str | None = Query(None),
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = ReportService(db)
    csv_content = await service.generate_csv_export(current_user["id"], startDate, endDate)
    filename = f"dailyflow_activities_{startDate or 'export'}_{endDate or 'all'}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/ai-insights", response_model=AIInsightResponse)
async def get_ai_insights(
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    ai_service = AIService(db)
    return await ai_service.generate_productivity_insights(current_user["id"])
