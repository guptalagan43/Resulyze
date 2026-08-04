"""Pydantic schemas for analysis results."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ScoreBreakdown(BaseModel):
    """Component-level score breakdown for transparency."""

    total: float
    similarity: float
    skills: float
    experience: float
    education: float
    certifications: float


class SkillGapItem(BaseModel):
    """Single skill gap entry."""

    skill_name: str
    gap_type: str
    required_level: Optional[str] = None
    recommended_resources: Optional[List[str]] = None


class AnalysisResponse(BaseModel):
    """Full analysis result for one resume-JD pair."""

    id: str
    resume_id: str
    job_id: str
    match_score: float
    score_breakdown: ScoreBreakdown
    skill_gaps: List[SkillGapItem] = []
    candidate_name: Optional[str] = None
    candidate_skills: Optional[List[str]] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisListResponse(BaseModel):
    """Ranked list of analyses for one JD."""

    analyses: List[AnalysisResponse]
    total: int
    job_title: Optional[str] = None


class MatchRequest(BaseModel):
    """Request to match resume(s) against a JD."""

    resume_ids: List[str]
    job_id: str


class SelfCheckResponse(BaseModel):
    """Response for candidate self-serve check."""

    match_score: float
    score_breakdown: ScoreBreakdown
    skill_gaps: List[SkillGapItem] = []
    candidate_name: Optional[str] = None
    candidate_skills: Optional[List[str]] = None
    job_required_skills: Optional[List[str]] = None
