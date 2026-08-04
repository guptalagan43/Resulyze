"""ORM model package — import all models so Base.metadata discovers them."""

from app.models.user import User
from app.models.resume import Resume
from app.models.job_description import JobDescription
from app.models.analysis import Analysis
from app.models.skill_gap import SkillGap

__all__ = ["User", "Resume", "JobDescription", "Analysis", "SkillGap"]
