def test_get_progress_summary(client, student_auth_headers):
    # Make a submission first
    challenges = client.get("/api/challenges", headers=student_auth_headers).json()
    client.post(
        f"/api/challenges/{challenges[0]['id']}/submit",
        json={"challenge_id": challenges[0]["id"], "submitted_answer": "def test(): return True"},
        headers=student_auth_headers,
    )

    response = client.get("/api/progress", headers=student_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_challenges_completed"] >= 1
    assert "average_score" in data
    assert "learning_streak" in data
    assert "strong_concepts" in data
    assert "weak_concepts" in data
    assert "recommended_challenges" in data


def test_get_concept_mastery_list(client, student_auth_headers):
    response = client.get("/api/progress/concepts", headers=student_auth_headers)
    assert response.status_code == 200
    masteries = response.json()
    assert isinstance(masteries, list)


def test_get_learning_history_list(client, student_auth_headers):
    response = client.get("/api/progress/history", headers=student_auth_headers)
    assert response.status_code == 200
    histories = response.json()
    assert isinstance(histories, list)
    assert len(histories) >= 1  # From registration activity


def test_get_and_update_profile(client, student_auth_headers):
    # Get profile
    get_resp = client.get("/api/profile", headers=student_auth_headers)
    assert get_resp.status_code == 200
    profile = get_resp.json()
    assert profile["email"] == "student@example.com"

    # Update profile
    update_payload = {
        "full_name": "Updated Student Name",
        "preferred_language": "JavaScript",
        "preferred_difficulty": "Intermediate",
    }
    put_resp = client.put("/api/profile", json=update_payload, headers=student_auth_headers)
    assert put_resp.status_code == 200
    updated = put_resp.json()
    assert updated["full_name"] == "Updated Student Name"
    assert updated["preferred_language"] == "JavaScript"
