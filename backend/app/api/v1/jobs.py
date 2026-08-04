"""Job description routes — create, list, get."""

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.job_description import JobDescription
from app.models.user import User
from app.schemas.job import JobCreate, JobListResponse, JobResponse
from app.services.skill_extractor import extract_skills_from_jd

router = APIRouter()


def _to_response(jd: JobDescription) -> dict:
    """Convert JD ORM to response dict."""
    return {
        "id": jd.id,
        "title": jd.title,
        "raw_text": jd.raw_text,
        "required_skills": json.loads(jd.required_skills) if jd.required_skills else [],
        "preferred_skills": json.loads(jd.preferred_skills) if jd.preferred_skills else [],
        "min_experience": jd.min_experience,
        "education_req": jd.education_req,
        "status": jd.status,
        "created_at": jd.created_at,
    }


@router.post("/", response_model=JobResponse, status_code=201)
def create_job(
    body: JobCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new job description and parse skills."""
    required, preferred = extract_skills_from_jd(body.raw_text)
    jd = JobDescription(
        recruiter_id=user.id,
        title=body.title,
        raw_text=body.raw_text,
        required_skills=json.dumps(required),
        preferred_skills=json.dumps(preferred),
        status="parsed",
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)
    return _to_response(jd)


@router.get("/", response_model=JobListResponse)
def list_jobs(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all JDs created by the current user."""
    jobs = db.query(JobDescription).filter(
        JobDescription.recruiter_id == user.id
    ).all()
    return {"jobs": [_to_response(j) for j in jobs], "total": len(jobs)}


@router.get("/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single job description by ID."""
    jd = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not jd:
        raise HTTPException(404, "Job description not found")
    return _to_response(jd)
