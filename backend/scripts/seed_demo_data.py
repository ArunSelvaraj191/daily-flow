import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath("."))
from datetime import datetime, date, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import hash_password
from app.db.indexes import create_db_indexes

async def seed():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.MONGODB_DATABASE]
    await create_db_indexes(db)

    print("Cleaning existing demo user data...")
    email = "alex@dailyflow.app"
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        user_id = str(existing_user["_id"])
        await db.activities.delete_many({"userId": user_id})
        await db.habits.delete_many({"userId": user_id})
        await db.habit_logs.delete_many({"userId": user_id})
        await db.goals.delete_many({"userId": user_id})
        await db.timer_sessions.delete_many({"userId": user_id})
        await db.users.delete_one({"_id": existing_user["_id"]})

    now = datetime.now(timezone.utc)
    today = date.today()

    # 1. Create User
    user_doc = {
        "email": email,
        "passwordHash": hash_password("FlowPassword123"),
        "fullName": "Alex Morgan",
        "timezone": "America/New_York",
        "preferences": {
            "theme": "light",
            "timezone": "America/New_York",
            "dailyGoalMinutes": 480,
            "defaultCategory": "Work"
        },
        "createdAt": now,
        "updatedAt": now
    }
    user_res = await db.users.insert_one(user_doc)
    user_id = str(user_res.inserted_id)
    print(f"Created demo user: {email} (ID: {user_id})")

    # 2. Create Activities
    activities_data = [
        {
            "userId": user_id,
            "title": "Design Core Architecture",
            "description": "Specify schemas, async FastAPI routes and MongoDB collections",
            "category": "Work",
            "priority": "High",
            "status": "Completed",
            "activityDate": today.isoformat(),
            "plannedStartTime": "09:00",
            "plannedEndTime": "10:30",
            "plannedDuration": 90,
            "actualDuration": 95,
            "tags": ["backend", "fastapi", "architecture"],
            "notes": "Reviewed with engineering team.",
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "title": "Complete UX Design Challenge",
            "description": "Refine SaaS dashboard components and Material UI theme tokens",
            "category": "Work",
            "priority": "Urgent",
            "status": "Completed",
            "activityDate": today.isoformat(),
            "plannedStartTime": "11:00",
            "plannedEndTime": "12:15",
            "plannedDuration": 75,
            "actualDuration": 80,
            "tags": ["ui", "design", "mui"],
            "notes": "Sleek rounded cards with glowing coral accent.",
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "title": "Morning 5K Run & Stretch",
            "description": "Cardio session in the park",
            "category": "Fitness",
            "priority": "Medium",
            "status": "Completed",
            "activityDate": today.isoformat(),
            "plannedStartTime": "07:00",
            "plannedEndTime": "07:35",
            "plannedDuration": 35,
            "actualDuration": 35,
            "tags": ["cardio", "health"],
            "notes": "Felt energized afterwards.",
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "title": "Review Product Roadmap & Sprint Backlog",
            "description": "Organize upcoming milestones and sprint allocations",
            "category": "Work",
            "priority": "Medium",
            "status": "In Progress",
            "activityDate": today.isoformat(),
            "plannedStartTime": "14:00",
            "plannedEndTime": "15:00",
            "plannedDuration": 60,
            "actualDuration": 25,
            "tags": ["planning", "roadmap"],
            "notes": "",
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "title": "Read Little Women (Chapter 4-5)",
            "description": "Evening reading time",
            "category": "Personal",
            "priority": "Low",
            "status": "Pending",
            "activityDate": today.isoformat(),
            "plannedStartTime": "20:00",
            "plannedEndTime": "20:30",
            "plannedDuration": 30,
            "actualDuration": 0,
            "tags": ["books", "habits"],
            "notes": "",
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "title": "Python FastAPI Async Benchmarks",
            "description": "Measure connection pool concurrency and Motor latency",
            "category": "Learning",
            "priority": "High",
            "status": "Completed",
            "activityDate": (today - timedelta(days=1)).isoformat(),
            "plannedStartTime": "10:00",
            "plannedEndTime": "12:00",
            "plannedDuration": 120,
            "actualDuration": 125,
            "tags": ["learning", "benchmarking"],
            "notes": "Motor handled 1000 concurrent reqs with low latency.",
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "title": "Full Body Mobility Session",
            "description": "Foam rolling and dynamic mobility",
            "category": "Health",
            "priority": "Medium",
            "status": "Completed",
            "activityDate": (today - timedelta(days=2)).isoformat(),
            "plannedStartTime": "18:00",
            "plannedEndTime": "18:40",
            "plannedDuration": 40,
            "actualDuration": 40,
            "tags": ["mobility", "recovery"],
            "notes": "",
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "title": "Draft Product Launch Newsletter",
            "description": "Prepare release notes and screenshot previews",
            "category": "Content Creation",
            "priority": "High",
            "status": "Completed",
            "activityDate": (today - timedelta(days=3)).isoformat(),
            "plannedStartTime": "13:00",
            "plannedEndTime": "14:15",
            "plannedDuration": 75,
            "actualDuration": 75,
            "tags": ["content", "newsletter"],
            "notes": "",
            "createdAt": now,
            "updatedAt": now
        }
    ]
    act_res = await db.activities.insert_many(activities_data)
    activity_ids = [str(x) for x in act_res.inserted_ids]
    in_progress_act_id = activity_ids[3]  # "Review Product Roadmap"
    print(f"Created {len(activities_data)} activities.")

    # 3. Create Active Timer Session
    active_timer_doc = {
        "userId": user_id,
        "activityId": in_progress_act_id,
        "status": "running",
        "startedAt": now - timedelta(minutes=10, seconds=45),
        "pausedAt": None,
        "stoppedAt": None,
        "accumulatedSeconds": 0,
        "segments": [
            {
                "startTime": now - timedelta(minutes=10, seconds=45),
                "endTime": None,
                "durationSeconds": 0
            }
        ],
        "createdAt": now - timedelta(minutes=10, seconds=45),
        "updatedAt": now
    }
    await db.timer_sessions.insert_one(active_timer_doc)
    print("Created active timer session (10m 45s elapsed).")

    # 4. Create Habits
    habits = [
        {
            "userId": user_id,
            "name": "Morning Routine & Meditation",
            "description": "15 minutes of mindfulness and journaling",
            "category": "Health",
            "frequency": "daily",
            "selectedWeekdays": [0, 1, 2, 3, 4, 5, 6],
            "targetDuration": 15,
            "targetCount": 1,
            "startDate": (today - timedelta(days=30)).isoformat(),
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "name": "Read 30 mins",
            "description": "Non-fiction or literature",
            "category": "Learning",
            "frequency": "daily",
            "selectedWeekdays": [0, 1, 2, 3, 4, 5, 6],
            "targetDuration": 30,
            "targetCount": 1,
            "startDate": (today - timedelta(days=20)).isoformat(),
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "name": "Drink 2.5L Water",
            "description": "Maintain hydration throughout the workday",
            "category": "Health",
            "frequency": "daily",
            "selectedWeekdays": [0, 1, 2, 3, 4, 5, 6],
            "targetDuration": 5,
            "targetCount": 1,
            "startDate": (today - timedelta(days=15)).isoformat(),
            "isActive": True,
            "createdAt": now,
            "updatedAt": now
        }
    ]
    h_res = await db.habits.insert_many(habits)
    h_ids = [str(x) for x in h_res.inserted_ids]

    # Create logs for Morning Meditation for past 10 days (streak of 10!)
    habit_logs = []
    for i in range(10):
        d_str = (today - timedelta(days=i)).isoformat()
        habit_logs.append({
            "userId": user_id,
            "habitId": h_ids[0],
            "date": d_str,
            "completed": True,
            "durationMinutes": 15,
            "notes": "Done!",
            "createdAt": now,
            "updatedAt": now
        })
    # Create logs for Read 30 mins for past 5 days
    for i in range(5):
        d_str = (today - timedelta(days=i)).isoformat()
        habit_logs.append({
            "userId": user_id,
            "habitId": h_ids[1],
            "date": d_str,
            "completed": True,
            "durationMinutes": 30,
            "notes": "Chapter read",
            "createdAt": now,
            "updatedAt": now
        })
    await db.habit_logs.insert_many(habit_logs)
    print("Created habits and streak logs.")

    # 5. Create Goals
    goals_data = [
        {
            "userId": user_id,
            "title": "Learn Python & Modern APIs for 10 Hours",
            "description": "Deep study and hands-on coding with FastAPI and async drivers",
            "category": "Learning",
            "metricType": "duration_minutes",
            "targetValue": 600,
            "measurementPeriod": "weekly",
            "startDate": (today - timedelta(days=6)).isoformat(),
            "endDate": (today + timedelta(days=1)).isoformat(),
            "status": "active",
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "title": "Complete 10 High-Impact Work Activities",
            "description": "Ship core product deliverables",
            "category": "Work",
            "metricType": "activity_count",
            "targetValue": 10,
            "measurementPeriod": "weekly",
            "startDate": (today - timedelta(days=6)).isoformat(),
            "endDate": (today + timedelta(days=1)).isoformat(),
            "status": "active",
            "createdAt": now,
            "updatedAt": now
        },
        {
            "userId": user_id,
            "title": "Consistent Meditation (7 sessions)",
            "description": "Maintain daily morning focus streak",
            "category": "Health",
            "metricType": "habit_count",
            "targetValue": 7,
            "measurementPeriod": "weekly",
            "startDate": (today - timedelta(days=6)).isoformat(),
            "endDate": (today + timedelta(days=1)).isoformat(),
            "status": "completed",
            "createdAt": now,
            "updatedAt": now
        }
    ]
    await db.goals.insert_many(goals_data)
    print("Created goals.")

    client.close()
    print("Demo data successfully seeded!")

if __name__ == "__main__":
    asyncio.run(seed())
