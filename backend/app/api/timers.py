from fastapi import APIRouter, Depends, status

from app.db.mongodb import get_database
from app.dependencies.auth import get_current_user
from app.schemas.timer import ActiveTimerResponse, TimerSessionResponse, TimerStartRequest
from app.services.timer_service import TimerService

router = APIRouter(prefix="/timers", tags=["Timers"])


@router.get("/active", response_model=ActiveTimerResponse)
async def get_active_timer(
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = TimerService(db)
    return await service.get_active_session(current_user["id"])


@router.post("/start", response_model=TimerSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_timer(
    req: TimerStartRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = TimerService(db)
    return await service.start_timer(current_user["id"], req)


@router.post("/{session_id}/pause", response_model=TimerSessionResponse)
async def pause_timer(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = TimerService(db)
    return await service.pause_timer(current_user["id"], session_id)


@router.post("/{session_id}/resume", response_model=TimerSessionResponse)
async def resume_timer(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = TimerService(db)
    return await service.resume_timer(current_user["id"], session_id)


@router.post("/{session_id}/stop", response_model=TimerSessionResponse)
async def stop_timer(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database)
):
    service = TimerService(db)
    return await service.stop_timer(current_user["id"], session_id)
