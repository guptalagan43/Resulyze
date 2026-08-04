"""Skill Gap ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text, ForeignKey

from app.database import Base
from sqlalchemy.orm import relationship


class SkillGap(Base):
    """Individual skill gap record for an analysis."""

    __tablename__ = "skill_gaps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id = Column(String, ForeignKey("analyses.id"), index=True, nullable=False)
    skill_name = Column(String, nullable=False)
    gap_type = Column(String, nullable=False)
    required_level = Column(String, nullable=True)
    recommended_resources = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship(
        "Analysis",
        back_populates="skill_gaps",
        foreign_keys=[analysis_id],
    )
