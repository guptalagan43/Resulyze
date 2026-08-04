"""Resume routes — upload, list, get, delete."""

import json
import shutil
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.ml.model_registry import get_registry
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeListResponse, ResumeParsedDetail, ResumeResponse
from app.services.ner_extractor import extract_entities
from app.services.resume_parser import extract_text
from app.services.skill_extractor import extract_skills_simple

router = APIRouter()

ALLOWED_TYPES = {".pdf", ".docx", ".txt"}
MAX_SIZE = settings.MAX_RESUME_SIZE_MB * 1024 * 1024


def _save_and_parse(file: UploadFile, user_id: str, db: Session) -> Resume:
    """Save file to disk and run parsing pipeline."""
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type: {suffix}")

    file_id = str(uuid.uuid4())
    upload_dir = settings.upload_path / file_id
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / f"resume{suffix}"

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    raw_text = extract_text(str(file_path))
    registry = get_registry()
    entities = extract_entities(raw_text, registry.nlp) if registry.nlp else {}
    skills = extract_skills_simple(raw_text)

    resume = Resume(
        id=file_id,
        user_id=user_id,
        filename=file.filename,
        file_path=str(file_path),
        raw_text=raw_text,
        parsed_json=json.dumps(entities),
        candidate_name=entities.get("name"),
        candidate_email=entities.get("email"),
        skills=json.dumps(skills),
        experience_years=entities.get("experience_years"),
        education_level=entities.get("education_level"),
        status="parsed",
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


def _to_response(r: Resume) -> dict:
    """Convert Resume ORM to response dict."""
    skills = json.loads(r.skills) if r.skills else []
    return {
        "id": r.id, "filename": r.filename,
        "candidate_name": r.candidate_name,
        "candidate_email": r.candidate_email,
        "skills": skills,
        "experience_years": r.experience_years,
        "education_level": r.education_level,
        "status": r.status, "uploaded_at": r.uploaded_at,
    }


@router.post("/upload", response_model=ResumeResponse, status_code=201)
def upload_resume(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload and parse a single resume."""
    resume = _save_and_parse(file, user.id, db)
    return _to_response(resume)


@router.post("/bulk-upload", response_model=List[ResumeResponse], status_code=201)
def bulk_upload(
    files: List[UploadFile] = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload and parse multiple resumes (up to 200)."""
    if len(files) > 200:
        raise HTTPException(400, "Maximum 200 files per upload")
    results = []
    for f in files:
        try:
            resume = _save_and_parse(f, user.id, db)
            results.append(_to_response(resume))
        except Exception:
            results.append({"error": f"Failed to process {f.filename}"})
    return results


@router.get("/", response_model=ResumeListResponse)
def list_resumes(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all resumes uploaded by the current user."""
    resumes = db.query(Resume).filter(Resume.user_id == user.id).all()
    return {
        "resumes": [_to_response(r) for r in resumes],
        "total": len(resumes),
    }


@router.get("/{resume_id}", response_model=ResumeParsedDetail)
def get_resume(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full parsed detail for a single resume."""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    return {
        **_to_response(resume),
        "raw_text": resume.raw_text,
        "parsed_data": json.loads(resume.parsed_json) if resume.parsed_json else None,
    }


@router.delete("/{resume_id}", status_code=204)
def delete_resume(
    resume_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a resume."""
    resume = db.query(Resume).filter(
        Resume.id == resume_id, Resume.user_id == user.id
    ).first()
    if not resume:
        raise HTTPException(404, "Resume not found")
    db.delete(resume)
    db.commit()
