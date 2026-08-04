"""Pydantic schemas for job descriptions."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    """Schema for creating a new job description."""

    title: str = Field(..., min_length=1, max_length=255)
    raw_text: str = Field(..., min_length=10)


class JobResponse(BaseModel):
    """Schema for returning a job description."""

    id: str
    title: str
    raw_text: str
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    min_experience: Optional[int] = None
    education_req: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    """Paginated list of job descriptions."""

    jobs: List[JobResponse]
    total: int
