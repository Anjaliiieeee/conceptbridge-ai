def test_register_success(client):
    payload = {
        "full_name": "Ada Lovelace",
        "email": "ada@example.com",
        "password": "SecurePassword123!",
        "preferred_language": "Python",
        "preferred_difficulty": "Intermediate",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "ada@example.com"
    assert data["user"]["full_name"] == "Ada Lovelace"


def test_register_duplicate_email(client):
    payload = {
        "full_name": "Original User",
        "email": "duplicate@example.com",
        "password": "Password123!",
    }
    client.post("/api/auth/register", json=payload)
    # Attempt duplicate
    dup_payload = {
        "full_name": "Duplicate User",
        "email": "duplicate@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/auth/register", json=dup_payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["message"]


def test_register_invalid_email(client):
    payload = {
        "full_name": "Bad Email",
        "email": "not-an-email",
        "password": "Password123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


def test_register_short_password(client):
    payload = {
        "full_name": "Short Pass",
        "email": "short@example.com",
        "password": "123",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


def test_login_success(client):
    # Register first
    client.post("/api/auth/register", json={
        "full_name": "Login User",
        "email": "login@example.com",
        "password": "CorrectPassword123!",
    })
    # Login
    response = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "CorrectPassword123!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@example.com"


def test_login_wrong_password(client):
    response = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "WrongPassword123!",
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "Password123!",
    })
    assert response.status_code == 401


def test_get_me_authenticated(client, student_auth_headers):
    response = client.get("/api/auth/me", headers=student_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "student@example.com"


def test_get_me_unauthenticated(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
