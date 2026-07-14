import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_ticket_detail_includes_priority_and_activity_entries():
    response = client.post(
        "/api/tickets",
        json={
            "customer_name": "Asha",
            "customer_email": "asha@example.com",
            "subject": "Login issue",
            "description": "Cannot sign in",
            "priority": "High",
        },
    )
    ticket_id = response.json()["id"]

    update_response = client.put(
        f"/api/tickets/{ticket_id}",
        json={"status": "In Progress", "note": "Investigating"},
    )

    detail_response = client.get(f"/api/tickets/{ticket_id}")
    body = detail_response.json()

    assert body["priority"] == "High"
    assert body["activity"][0]["type"] == "created"
    assert body["activity"][1]["type"] == "status_updated"
    assert body["activity"][2]["type"] == "note_added"
