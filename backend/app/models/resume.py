"""Resume ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Resume(Base):
    """Uploaded and parsed resume."""

    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(Text, nullable=True)
    candidate_name = Column(String, nullable=True)
    candidate_email = Column(String, nullable=True)
    skills = Column(Text, nullable=True)
    experience_years = Column(Float, nullable=True)
    education_level = Column(String, nullable=True)
    status = Column(String, default="uploaded")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes", foreign_keys=[user_id])
    analyses = relationship("Analysis", back_populates="resume")
