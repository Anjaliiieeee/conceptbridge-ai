def test_submit_and_evaluate_correct_solution(client, student_auth_headers):
    # Fetch first challenge
    challenges = client.get("/api/challenges", headers=student_auth_headers).json()
    assert len(challenges) > 0
    target_challenge = challenges[0]

    submission_payload = {
        "challenge_id": target_challenge["id"],
        "submitted_answer": """
def process_transactions(transactions):
    total = 0.0
    count = 0
    if not transactions:
        return {'total_amount': total, 'valid_count': count}
    for tx in transactions:
        amt = tx.get('amount', 0)
        if amt > 0:
            total += amt
            count += 1
    return {'total_amount': total, 'valid_count': count}
        """,
    }

    response = client.post(
        f"/api/challenges/{target_challenge['id']}/submit",
        json=submission_payload,
        headers=student_auth_headers,
    )
    assert response.status_code == 201
    eval_data = response.json()
    assert 0 <= eval_data["score"] <= 100
    assert isinstance(eval_data["is_correct"], bool)
    assert len(eval_data["explanation"]) > 0
    assert "conceptual_gap" in eval_data
    assert "suggested_improvement" in eval_data
    assert "correct_approach" in eval_data
    assert eval_data["submission_id"] > 0


def test_submit_incomplete_answer_detects_gap(client, student_auth_headers):
    challenges = client.get("/api/challenges", headers=student_auth_headers).json()
    target_challenge = challenges[0]

    # Minimal faulty submission
    submission_payload = {
        "challenge_id": target_challenge["id"],
        "submitted_answer": "pass",
    }

    response = client.post(
        f"/api/challenges/{target_challenge['id']}/submit",
        json=submission_payload,
        headers=student_auth_headers,
    )
    assert response.status_code == 201
    eval_data = response.json()
    assert eval_data["is_correct"] is False
    assert eval_data["score"] < 50
    assert len(eval_data["conceptual_gap"]) > 0


def test_get_evaluation_by_id(client, student_auth_headers):
    challenges = client.get("/api/challenges", headers=student_auth_headers).json()
    target_challenge = challenges[0]

    sub_resp = client.post(
        f"/api/challenges/{target_challenge['id']}/submit",
        json={"challenge_id": target_challenge["id"], "submitted_answer": "print('hello world')"},
        headers=student_auth_headers,
    )
    eval_record = sub_resp.json()
    sub_id = eval_record["submission_id"]

    # Fetch evaluation
    fetch_resp = client.get(f"/api/evaluations/{sub_id}", headers=student_auth_headers)
    assert fetch_resp.status_code == 200
    data = fetch_resp.json()
    assert data["submission_id"] == sub_id
    assert data["score"] == eval_record["score"]
