import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_activity_crud_and_isolation(
    client: AsyncClient,
    auth_headers: dict,
    auth_headers_user2: dict
):
    # 1. Create activity for User 1
    create_payload = {
        "title": "Build Architecture Specs",
        "description": "Design modular FastAPI architecture",
        "category": "Work",
        "priority": "High",
        "status": "Pending",
        "activityDate": "2026-10-15",
        "plannedStartTime": "09:00",
        "plannedEndTime": "11:00",
        "plannedDuration": 120,
        "tags": ["fastapi", "backend"]
    }
    create_resp = await client.post("/api/v1/activities", headers=auth_headers, json=create_payload)
    assert create_resp.status_code == 201
    act1 = create_resp.json()
    assert act1["title"] == "Build Architecture Specs"
    act_id = act1["id"]

    # 2. Get activity
    get_resp = await client.get(f"/api/v1/activities/{act_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == act_id

    # 3. User 2 cannot access User 1's activity (Isolation check)
    get_user2 = await client.get(f"/api/v1/activities/{act_id}", headers=auth_headers_user2)
    assert get_user2.status_code == 404

    # 4. User 2 cannot update User 1's activity
    update_user2 = await client.patch(
        f"/api/v1/activities/{act_id}",
        headers=auth_headers_user2,
        json={"title": "Hacked Title"}
    )
    assert update_user2.status_code == 404

    # 5. User 1 updates activity
    patch_resp = await client.patch(
        f"/api/v1/activities/{act_id}",
        headers=auth_headers,
        json={"title": "Refined Architecture Specs", "priority": "Urgent"}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["title"] == "Refined Architecture Specs"
    assert patch_resp.json()["priority"] == "Urgent"

    # 6. Toggle complete
    comp_resp = await client.post(f"/api/v1/activities/{act_id}/complete", headers=auth_headers)
    assert comp_resp.status_code == 200
    assert comp_resp.json()["status"] == "Completed"

    # 7. List and filter
    list_resp = await client.get(
        "/api/v1/activities?category=Work&status=Completed",
        headers=auth_headers
    )
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] >= 1

    # 8. Delete activity
    del_resp = await client.delete(f"/api/v1/activities/{act_id}", headers=auth_headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["success"] is True

    # 9. Verify deleted
    get_deleted = await client.get(f"/api/v1/activities/{act_id}", headers=auth_headers)
    assert get_deleted.status_code == 404
