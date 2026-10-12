import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_timer_lifecycle(client: AsyncClient, auth_headers: dict):
    # Create an activity for testing
    act_resp = await client.post("/api/v1/activities", headers=auth_headers, json={
        "title": "Timer Focus Task",
        "category": "Learning",
        "priority": "Medium",
        "status": "Pending",
        "activityDate": "2026-10-15",
        "plannedDuration": 60
    })
    assert act_resp.status_code == 201
    act_id = act_resp.json()["id"]

    # 1. Start timer
    start_resp = await client.post("/api/v1/timers/start", headers=auth_headers, json={
        "activityId": act_id
    })
    assert start_resp.status_code == 201
    session = start_resp.json()
    session_id = session["id"]
    assert session["status"] == "running"
    assert session["activityId"] == act_id

    # 2. Check active timer
    active_resp = await client.get("/api/v1/timers/active", headers=auth_headers)
    assert active_resp.status_code == 200
    active_data = active_resp.json()
    assert active_data["hasActiveTimer"] is True
    assert active_data["session"]["id"] == session_id

    # 3. Pause timer
    pause_resp = await client.post(f"/api/v1/timers/{session_id}/pause", headers=auth_headers)
    assert pause_resp.status_code == 200
    assert pause_resp.json()["status"] == "paused"

    # 4. Resume timer
    resume_resp = await client.post(f"/api/v1/timers/{session_id}/resume", headers=auth_headers)
    assert resume_resp.status_code == 200
    assert resume_resp.json()["status"] == "running"

    # 5. Stop timer
    stop_resp = await client.post(f"/api/v1/timers/{session_id}/stop", headers=auth_headers)
    assert stop_resp.status_code == 200
    assert stop_resp.json()["status"] == "stopped"

    # 6. Active timer should now be none
    active_after_stop = await client.get("/api/v1/timers/active", headers=auth_headers)
    assert active_after_stop.status_code == 200
    assert active_after_stop.json()["hasActiveTimer"] is False
