"""Analytics routes — aggregate stats for dashboards."""

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.analysis import Analysis
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.skill_gap import SkillGap
from app.models.user import User

router = APIRouter()


@router.get("/overview")
def overview_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Platform-wide stats for the current user."""
    resume_count = db.query(Resume).filter(Resume.user_id == user.id).count()
    job_count = db.query(JobDescription).filter(
        JobDescription.recruiter_id == user.id
    ).count()
    analysis_count = db.query(Analysis).count()
    return {
        "total_resumes": resume_count,
        "total_jobs": job_count,
        "total_analyses": analysis_count,
    }


@router.get("/job/{job_id}")
def job_analytics(
    job_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Per-JD analytics: score distribution, common skill gaps."""
    jd = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not jd:
        raise HTTPException(404, "Job not found")

    analyses = db.query(Analysis).filter(Analysis.job_id == job_id).all()
    scores = [a.match_score for a in analyses]

    gap_counts: dict[str, int] = {}
    for a in analyses:
        gaps = db.query(SkillGap).filter(
            SkillGap.analysis_id == a.id,
            SkillGap.gap_type == "critical",
        ).all()
        for g in gaps:
            gap_counts[g.skill_name] = gap_counts.get(g.skill_name, 0) + 1

    top_gaps = sorted(gap_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "job_title": jd.title,
        "total_candidates": len(analyses),
        "avg_score": round(sum(scores) / len(scores), 1) if scores else 0,
        "max_score": max(scores) if scores else 0,
        "min_score": min(scores) if scores else 0,
        "score_distribution": scores,
        "top_skill_gaps": [{"skill": s, "count": c} for s, c in top_gaps],
    }
