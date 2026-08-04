"""Analysis ORM model for match results."""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, String, ForeignKey

from sqlalchemy.orm import relationship

from app.database import Base


class Analysis(Base):
    """Result of matching one resume to one job description."""

    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String, ForeignKey("resumes.id"), index=True, nullable=False)
    job_id = Column(String, ForeignKey("job_descriptions.id"), index=True, nullable=False)
    match_score = Column(Float, default=0.0)
    similarity_score = Column(Float, default=0.0)
    skill_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    cert_score = Column(Float, default=0.0)
    reranker_score = Column(Float, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses", foreign_keys=[resume_id])
    job = relationship("JobDescription", back_populates="analyses", foreign_keys=[job_id])
    skill_gaps = relationship("SkillGap", back_populates="analysis")
