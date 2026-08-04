"""Job Description ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey

from sqlalchemy.orm import relationship

from app.database import Base


class JobDescription(Base):
    """Job description created by a recruiter."""

    __tablename__ = "job_descriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    recruiter_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    title = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=True)
    preferred_skills = Column(Text, nullable=True)
    min_experience = Column(Integer, nullable=True)
    education_req = Column(String, nullable=True)
    status = Column(String, default="created")
    created_at = Column(DateTime, default=datetime.utcnow)

    recruiter = relationship(
        "User",
        back_populates="job_descriptions",
        foreign_keys=[recruiter_id],
    )
    analyses = relationship("Analysis", back_populates="job")
