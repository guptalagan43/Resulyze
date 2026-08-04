"""Analysis routes — match resumes to JDs, get results, self-check."""

import json
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.ml.model_registry import get_registry
from app.models.analysis import Analysis
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.skill_gap import SkillGap
from app.models.user import User
from app.schemas.analysis import (
    AnalysisListResponse,
    AnalysisResponse,
    MatchRequest,
    ScoreBreakdown,
    SelfCheckResponse,
    SkillGapItem,
)
from app.services.gap_analyzer import analyze_gaps
from app.services.matcher import compute_match
from app.services.ner_extractor import extract_entities
from app.services.resume_parser import extract_text
from app.services.skill_extractor import extract_skills_from_jd, extract_skills_simple

router = APIRouter()


def _build_analysis_response(a: Analysis, db: Session) -> dict:
    """Build full response dict from an Analysis ORM instance."""
    resume = db.query(Resume).filter(Resume.id == a.resume_id).first()
    gaps = db.query(SkillGap).filter(SkillGap.analysis_id == a.id).all()
    return {
        "id": a.id,
        "resume_id": a.resume_id,
        "job_id": a.job_id,
        "match_score": a.match_score,
        "score_breakdown": ScoreBreakdown(
            total=a.match_score,
            similarity=a.similarity_score,
            skills=a.skill_score,
            experience=a.experience_score,
            education=a.education_score,
            certifications=a.cert_score,
        ),
        "skill_gaps": [
            SkillGapItem(
                skill_name=g.skill_name,
                gap_type=g.gap_type,
                required_level=g.required_level,
                recommended_resources=json.loads(g.recommended_resources)
                if g.recommended_resources else [],
            ) for g in gaps
        ],
        "candidate_name": resume.candidate_name if resume else None,
        "candidate_skills": json.loads(resume.skills) if resume and resume.skills else [],
        "status": a.status,
        "created_at": a.created_at,
    }


def _run_match(resume: Resume, jd: JobDescription, db: Session) -> Analysis:
    """Run ML matching and gap analysis for one resume-JD pair."""
    registry = get_registry()
    c_skills = json.loads(resume.skills) if resume.skills else []
    r_skills = json.loads(jd.required_skills) if jd.required_skills else []
    p_skills = json.loads(jd.preferred_skills) if jd.preferred_skills else []

    scores = compute_match(
        resume_text=resume.raw_text or "",
        jd_text=jd.raw_text,
        candidate_skills=c_skills,
        required_skills=r_skills,
        candidate_years=resume.experience_years,
        required_years=jd.min_experience,
        candidate_edu=resume.education_level,
        required_edu=jd.education_req,
        embedder=registry.get_embedder(),
        reranker_model=registry.reranker,
    )

    # Delete existing analysis for this resume & job pair to avoid duplicate rankings
    existing = db.query(Analysis).filter(
        Analysis.resume_id == resume.id,
        Analysis.job_id == jd.id
    ).all()
    for ext in existing:
        db.query(SkillGap).filter(SkillGap.analysis_id == ext.id).delete()
        db.delete(ext)
    db.flush()

    analysis = Analysis(
        resume_id=resume.id,
        job_id=jd.id,
        match_score=scores["match_score"],
        similarity_score=scores["similarity_score"],
        skill_score=scores["skill_score"],
        experience_score=scores["experience_score"],
        education_score=scores["education_score"],
        cert_score=scores["cert_score"],
        reranker_score=scores.get("reranker_score"),
        status="completed",
    )
    db.add(analysis)
    db.flush()

    gaps = analyze_gaps(c_skills, r_skills, p_skills)
    for g in gaps:
        db.add(SkillGap(
            analysis_id=analysis.id,
            skill_name=g["skill_name"],
            gap_type=g["gap_type"],
            required_level=g.get("required_level"),
            recommended_resources=json.dumps(g.get("recommended_resources", [])),
        ))
    db.commit()
    db.refresh(analysis)
    return analysis


@router.post("/match", response_model=list[AnalysisResponse], status_code=201)
def match_resumes(
    body: MatchRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Match one or more resumes against a job description."""
    jd = db.query(JobDescription).filter(JobDescription.id == body.job_id).first()
    if not jd:
        raise HTTPException(404, "Job description not found")

    results = []
    for rid in body.resume_ids:
        resume = db.query(Resume).filter(Resume.id == rid).first()
        if not resume:
            continue
        analysis = _run_match(resume, jd, db)
        results.append(_build_analysis_response(analysis, db))

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


@router.get("/job/{job_id}", response_model=AnalysisListResponse)
def get_analyses_by_job(
    job_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all analyses for a job, sorted by score descending."""
    jd = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not jd:
        raise HTTPException(404, "Job description not found")
    analyses = db.query(Analysis).filter(
        Analysis.job_id == job_id
    ).order_by(Analysis.match_score.desc()).all()

    return {
        "analyses": [_build_analysis_response(a, db) for a in analyses],
        "total": len(analyses),
        "job_title": jd.title,
    }


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single analysis result."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(404, "Analysis not found")
    return _build_analysis_response(analysis, db)


@router.post("/self-check", response_model=SelfCheckResponse)
def self_check(
    file: UploadFile = File(...),
    job_text: str = Form(...),
    db: Session = Depends(get_db),
):
    """Candidate self-serve: upload resume + paste JD, get instant analysis."""
    suffix = Path(file.filename).suffix.lower()
    if suffix not in {".pdf", ".docx", ".txt"}:
        raise HTTPException(400, f"Unsupported file type: {suffix}")

    file_id = str(uuid.uuid4())
    upload_dir = settings.upload_path / file_id
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / f"resume{suffix}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    raw_text = extract_text(str(file_path))
    registry = get_registry()
    nlp = registry.get_nlp()
    entities = extract_entities(raw_text, nlp) if nlp else {}
    c_skills = extract_skills_simple(raw_text)
    r_skills, p_skills = extract_skills_from_jd(job_text)

    scores = compute_match(
        resume_text=raw_text,
        jd_text=job_text,
        candidate_skills=c_skills,
        required_skills=r_skills,
        candidate_years=entities.get("experience_years"),
        required_years=None,
        candidate_edu=entities.get("education_level"),
        required_edu=None,
        embedder=registry.get_embedder(),
        reranker_model=registry.reranker,
    )

    gaps = analyze_gaps(c_skills, r_skills, p_skills)

    return SelfCheckResponse(
        match_score=scores["match_score"],
        score_breakdown=ScoreBreakdown(
            total=scores["match_score"],
            similarity=scores["similarity_score"],
            skills=scores["skill_score"],
            experience=scores["experience_score"],
            education=scores["education_score"],
            certifications=scores["cert_score"],
        ),
        skill_gaps=[
            SkillGapItem(
                skill_name=g["skill_name"],
                gap_type=g["gap_type"],
                required_level=g.get("required_level"),
                recommended_resources=g.get("recommended_resources", []),
            ) for g in gaps
        ],
        candidate_name=entities.get("name"),
        candidate_skills=c_skills,
        job_required_skills=r_skills,
    )


@router.delete("/job/{job_id}", status_code=204)
def clear_job_analyses(
    job_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clear all analysis results for a job description."""
    analyses = db.query(Analysis).filter(Analysis.job_id == job_id).all()
    for a in analyses:
        db.query(SkillGap).filter(SkillGap.analysis_id == a.id).delete()
        db.delete(a)
    db.commit()

