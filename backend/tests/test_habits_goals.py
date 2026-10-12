from datetime import date, timedelta

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_habits_and_streaks(client: AsyncClient, auth_headers: dict):
    # Create a habit
    create_resp = await client.post("/api/v1/habits", headers=auth_headers, json={
        "name": "Daily Morning Run",
        "description": "5km run every morning",
        "category": "Fitness",
        "frequency": "daily",
        "targetDuration": 30,
        "startDate": "2026-10-01"
    })
    assert create_resp.status_code == 201
    habit = create_resp.json()
    habit_id = habit["id"]

    today = date.today()
    yesterday = today - timedelta(days=1)

    # Log yesterday
    log1 = await client.post(f"/api/v1/habits/{habit_id}/logs", headers=auth_headers, json={
        "date": yesterday.isoformat(),
        "completed": True,
        "durationMinutes": 30
    })
    assert log1.status_code == 200

    # Log today
    log2 = await client.post(f"/api/v1/habits/{habit_id}/logs", headers=auth_headers, json={
        "date": today.isoformat(),
        "completed": True,
        "durationMinutes": 35
    })
    assert log2.status_code == 200

    # Check updated habit has currentStreak >= 2
    habit_resp = await client.get("/api/v1/habits", headers=auth_headers)
    assert habit_resp.status_code == 200
    habits = habit_resp.json()
    matched = [h for h in habits if h["id"] == habit_id][0]
    assert matched["currentStreak"] >= 2
    assert matched["completedToday"] is True


@pytest.mark.asyncio
async def test_goals_progress(client: AsyncClient, auth_headers: dict):
    # Create activity with tracked time
    today = date.today().isoformat()
    await client.post("/api/v1/activities", headers=auth_headers, json={
        "title": "Deep Python Study",
        "category": "Learning",
        "priority": "High",
        "status": "Completed",
        "activityDate": today,
        "plannedDuration": 60,
        "actualDuration": 90
    })

    # Create goal: Learn for 120 minutes this week
    goal_resp = await client.post("/api/v1/goals", headers=auth_headers, json={
        "title": "Master Python Core",
        "category": "Learning",
        "metricType": "duration_minutes",
        "targetValue": 120.0,
        "measurementPeriod": "weekly",
        "startDate": today
    })
    assert goal_resp.status_code == 201
    goal = goal_resp.json()
    assert goal["currentValue"] >= 90.0
    assert goal["progressPercentage"] >= 75.0
