"""Pydantic schemas for resume upload and response."""

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel


class ResumeResponse(BaseModel):
    """Schema for returning parsed resume data."""

    id: str
    filename: str
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[float] = None
    education_level: Optional[str] = None
    status: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class ResumeListResponse(BaseModel):
    """Paginated list of resumes."""

    resumes: List[ResumeResponse]
    total: int


class ResumeParsedDetail(BaseModel):
    """Full parsed resume detail for candidate profile."""

    id: str
    filename: str
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[float] = None
    education_level: Optional[str] = None
    raw_text: Optional[str] = None
    parsed_data: Optional[dict] = None
    status: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}
