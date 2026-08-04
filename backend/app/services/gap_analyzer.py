"""Gap analyzer — diffs candidate skills against JD requirements."""

import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

LEARNING_RESOURCES: Dict[str, List[str]] = {
    "python": ["Python for Everybody (Coursera)", "Automate the Boring Stuff"],
    "javascript": ["JavaScript.info", "freeCodeCamp JS Course"],
    "react": ["React Official Tutorial", "Scrimba React Course"],
    "node.js": ["NodeSchool.io", "The Odin Project - Node"],
    "docker": ["Docker Getting Started (docs.docker.com)", "KodeKloud Docker"],
    "kubernetes": ["Kubernetes the Hard Way", "KodeKloud CKA Course"],
    "aws": ["AWS Cloud Practitioner (free tier)", "Stephane Maarek - AWS on Udemy"],
    "sql": ["SQLBolt.com", "Mode Analytics SQL Tutorial"],
    "machine learning": ["Andrew Ng ML Course (Coursera)", "fast.ai"],
    "git": ["Git Immersion", "Atlassian Git Tutorials"],
    "typescript": ["TypeScript Handbook", "Total TypeScript by Matt Pocock"],
    "java": ["MOOC.fi Java Programming", "Baeldung Tutorials"],
    "c++": ["LearnCpp.com", "C++ Primer (book)"],
}


def analyze_gaps(
    candidate_skills: List[str],
    required_skills: List[str],
    preferred_skills: Optional[List[str]] = None,
) -> List[dict]:
    """Diff candidate skills against JD skills and classify gaps."""
    preferred_skills = preferred_skills or []
    candidate_set = {s.lower() for s in candidate_skills}
    gaps = []

    for skill in required_skills:
        skill_lower = skill.lower()
        if skill_lower in candidate_set:
            gaps.append({
                "skill_name": skill,
                "gap_type": "present",
                "required_level": "must-have",
                "recommended_resources": [],
            })
        else:
            resources = LEARNING_RESOURCES.get(skill_lower, [])
            gaps.append({
                "skill_name": skill,
                "gap_type": "critical",
                "required_level": "must-have",
                "recommended_resources": resources,
            })

    for skill in preferred_skills:
        skill_lower = skill.lower()
        if skill_lower in candidate_set:
            gaps.append({
                "skill_name": skill,
                "gap_type": "present",
                "required_level": "nice-to-have",
                "recommended_resources": [],
            })
        else:
            resources = LEARNING_RESOURCES.get(skill_lower, [])
            gaps.append({
                "skill_name": skill,
                "gap_type": "moderate",
                "required_level": "nice-to-have",
                "recommended_resources": resources,
            })

    # Surplus skills — candidate has but JD doesn't need
    all_required = {s.lower() for s in required_skills + preferred_skills}
    for skill in candidate_skills:
        if skill.lower() not in all_required:
            gaps.append({
                "skill_name": skill,
                "gap_type": "surplus",
                "required_level": None,
                "recommended_resources": [],
            })

    return gaps
