import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.config import settings

# Use a test SQLite database
TEST_DATABASE_URL = "sqlite:///./test_resume_analyzer.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if os.path.exists("test_resume_analyzer.db"):
        os.remove("test_resume_analyzer.db")


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_auth_flow(client):
    # Register
    reg_data = {
        "email": "recruiter@example.com",
        "password": "securepassword",
        "full_name": "Jane Doe",
        "role": "recruiter"
    }
    response = client.post("/api/v1/auth/register", json=reg_data)
    assert response.status_code == 201
    res_data = response.json()
    assert "access_token" in res_data
    assert res_data["user"]["email"] == "recruiter@example.com"

    # Login
    login_data = {
        "email": "recruiter@example.com",
        "password": "securepassword"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    res_data = response.json()
    assert "access_token" in res_data


def test_self_check(client):
    resume_content = b"Jane Doe\nEmail: jane@example.com\nSkills: python, docker, aws\nExperience: 5 years"
    files = {"file": ("resume.txt", resume_content, "text/plain")}
    data = {"job_text": "Looking for python developer with docker and aws skills."}
    response = client.post("/api/v1/analysis/self-check", files=files, data=data)
    assert response.status_code == 200
    res = response.json()
    assert "match_score" in res
    assert "score_breakdown" in res
    assert "skill_gaps" in res
