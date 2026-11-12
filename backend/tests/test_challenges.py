def test_get_subjects(client):
    response = client.get("/api/subjects")
    assert response.status_code == 200
    subjects = response.json()
    assert len(subjects) >= 5
    subject_names = [s["subject_name"] for s in subjects]
    assert "Python" in subject_names
    assert "SQL" in subject_names
    assert "JavaScript" in subject_names


def test_get_subject_concepts(client):
    # Get subjects first
    subjects = client.get("/api/subjects").json()
    python_subj = next(s for s in subjects if s["subject_name"] == "Python")

    response = client.get(f"/api/subjects/{python_subj['id']}/concepts")
    assert response.status_code == 200
    concepts = response.json()
    assert len(concepts) > 0
    concept_names = [c["concept_name"] for c in concepts]
    assert "Loops" in concept_names or "Variables" in concept_names


def test_list_challenges(client, student_auth_headers):
    response = client.get("/api/challenges", headers=student_auth_headers)
    assert response.status_code == 200
    challenges = response.json()
    assert len(challenges) >= 1


def test_generate_challenge(client, student_auth_headers):
    payload = {
        "subject_name": "Python",
        "concept_name": "Loops",
        "difficulty": "Beginner",
    }
    response = client.post("/api/challenges/generate", json=payload, headers=student_auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert "title" in data
    assert "real_world_scenario" in data
    assert "requirements" in data
    assert data["difficulty"] == "Beginner"
    assert data["subject_name"] == "Python"


def test_get_challenge_detail(client, student_auth_headers):
    # Fetch list first
    challenges = client.get("/api/challenges", headers=student_auth_headers).json()
    assert len(challenges) > 0
    first_id = challenges[0]["id"]

    response = client.get(f"/api/challenges/{first_id}", headers=student_auth_headers)
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == first_id
    assert "expected_solution" in detail
    assert "evaluation_criteria" in detail
