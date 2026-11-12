def test_user_data_isolation(client, student_auth_headers, second_student_auth_headers):
    # Student A submits an answer
    challenges = client.get("/api/challenges", headers=student_auth_headers).json()
    sub_resp = client.post(
        f"/api/challenges/{challenges[0]['id']}/submit",
        json={"challenge_id": challenges[0]["id"], "submitted_answer": "def isolation_test(): pass"},
        headers=student_auth_headers,
    )
    submission_id = sub_resp.json()["submission_id"]

    # Student A can view their evaluation
    resp_a = client.get(f"/api/evaluations/{submission_id}", headers=student_auth_headers)
    assert resp_a.status_code == 200

    # Student B attempts to access Student A's evaluation -> MUST BE 403 FORBIDDEN
    resp_b = client.get(f"/api/evaluations/{submission_id}", headers=second_student_auth_headers)
    assert resp_b.status_code == 403
    assert "not authorized" in resp_b.json()["message"].lower()


def test_malformed_token_rejected(client):
    headers = {"Authorization": "Bearer not-a-valid-jwt-token"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401


def test_health_check_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
