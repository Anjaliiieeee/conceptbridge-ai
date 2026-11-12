import os
import sys
from pathlib import Path
from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Ensure backend root is in sys.path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.core.database import Base, get_db
from app.utils.seed_data import seed_database
from app.main import app

# In-memory SQLite for high-speed, isolated test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create fresh database schema and seed catalog data for testing."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Test client with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def student_auth_headers(client: TestClient) -> dict:
    """Helper fixture providing headers with valid JWT token."""
    reg_payload = {
        "full_name": "Test Student",
        "email": "student@example.com",
        "password": "Password123!",
        "preferred_language": "Python",
        "preferred_difficulty": "Beginner",
    }
    client.post("/api/auth/register", json=reg_payload)
    login_resp = client.post("/api/auth/login", json={"email": "student@example.com", "password": "Password123!"})
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_student_auth_headers(client: TestClient) -> dict:
    """Helper fixture providing headers for a second user to test isolation."""
    reg_payload = {
        "full_name": "Second Student",
        "email": "student2@example.com",
        "password": "Password123!",
        "preferred_language": "JavaScript",
        "preferred_difficulty": "Intermediate",
    }
    client.post("/api/auth/register", json=reg_payload)
    login_resp = client.post("/api/auth/login", json={"email": "student2@example.com", "password": "Password123!"})
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
