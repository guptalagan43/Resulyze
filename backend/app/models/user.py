"""User ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """Registered user: recruiter, candidate, or admin."""

    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(
        Enum("recruiter", "candidate", "admin", name="user_role"),
        nullable=False,
        default="candidate",
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user")
    job_descriptions = relationship("JobDescription", back_populates="recruiter")
