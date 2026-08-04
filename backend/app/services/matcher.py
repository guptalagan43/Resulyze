"""Matcher — computes weighted feature scores and overall match score."""

import logging
from typing import List, Optional

from app.services.embedding_service import cosine_similarity, encode_text

logger = logging.getLogger(__name__)

# Weights: Skills 40%, Experience 30%, Education 20%, Certs 10%
W_SKILLS = 0.40
W_EXPERIENCE = 0.30
W_EDUCATION = 0.20
W_CERTS = 0.10


def compute_skill_coverage(
    candidate_skills: List[str], required_skills: List[str]
) -> float:
    """Fraction of required skills the candidate has (0.0–1.0)."""
    if not required_skills:
        return 1.0
    candidate_set = {s.lower() for s in candidate_skills}
    matched = sum(1 for s in required_skills if s.lower() in candidate_set)
    return matched / len(required_skills)


def compute_experience_score(
    candidate_years: Optional[float], required_years: Optional[int]
) -> float:
    """Score experience match on a 0.0–1.0 scale."""
    if required_years is None or required_years == 0:
        return 1.0
    if candidate_years is None:
        return 0.3
    ratio = candidate_years / required_years
    return min(ratio, 1.0)


def compute_education_score(
    candidate_level: Optional[str], required_level: Optional[str]
) -> float:
    """Score education match on a 0.0–1.0 scale."""
    hierarchy = [
        "high school", "diploma", "associate",
        "bachelor", "master", "phd", "doctorate",
    ]
    if not required_level:
        return 1.0
    if not candidate_level:
        return 0.3

    def _rank(level: str) -> int:
        level_lower = level.lower()
        for i, h in enumerate(hierarchy):
            if h in level_lower:
                return i
        return -1

    c_rank = _rank(candidate_level)
    r_rank = _rank(required_level)
    if c_rank >= r_rank:
        return 1.0
    if r_rank - c_rank == 1:
        return 0.6
    return 0.3


def compute_match(
    resume_text: str,
    jd_text: str,
    candidate_skills: List[str],
    required_skills: List[str],
    candidate_years: Optional[float],
    required_years: Optional[int],
    candidate_edu: Optional[str],
    required_edu: Optional[str],
    embedder,
    reranker_model=None,
) -> dict:
    """Run the full matching pipeline and return score breakdown."""
    resume_vec = encode_text(resume_text, embedder)
    jd_vec = encode_text(jd_text, embedder)
    sim = cosine_similarity(resume_vec, jd_vec)

    skill_cov = compute_skill_coverage(candidate_skills, required_skills)
    exp_score = compute_experience_score(candidate_years, required_years)
    edu_score = compute_education_score(candidate_edu, required_edu)
    cert_score = 0.5  # placeholder — no cert extraction yet

    weighted = (
        W_SKILLS * skill_cov
        + W_EXPERIENCE * exp_score
        + W_EDUCATION * edu_score
        + W_CERTS * cert_score
    )
    # Blend similarity and weighted scores
    heuristic_total = round((0.4 * sim + 0.6 * weighted) * 100, 1)
    heuristic_total = max(0.0, min(100.0, heuristic_total))

    # XGBoost re-ranking if model is available
    final_total = heuristic_total
    reranked = None
    if reranker_model is not None:
        from app.services.reranker import rerank_score
        feature_vector = [sim, skill_cov, exp_score, edu_score, cert_score]
        pred_score = rerank_score(feature_vector, reranker_model)
        if pred_score is not None:
            final_total = round(pred_score, 1)
            reranked = final_total

    return {
        "match_score": final_total,
        "similarity_score": round(sim * 100, 1),
        "skill_score": round(skill_cov * 100, 1),
        "experience_score": round(exp_score * 100, 1),
        "education_score": round(edu_score * 100, 1),
        "cert_score": round(cert_score * 100, 1),
        "reranker_score": reranked,
    }
