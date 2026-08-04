"""Skill extractor — matches text tokens against a skill taxonomy using fuzzy matching."""

import json
import logging
import re
from pathlib import Path
from typing import List, Set, Tuple

from app.config import settings

logger = logging.getLogger(__name__)

_taxonomy_cache: List[str] = []


def load_taxonomy() -> List[str]:
    """Load skill taxonomy from JSON file, cache in memory."""
    global _taxonomy_cache
    if _taxonomy_cache:
        return _taxonomy_cache
    tax_path = Path(settings.SKILL_TAXONOMY_PATH)
    if not tax_path.exists():
        logger.warning("Skill taxonomy not found at %s", tax_path)
        return []
    with open(tax_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    _taxonomy_cache = [s.lower().strip() for s in data.get("skills", [])]
    logger.info("Loaded %d skills from taxonomy", len(_taxonomy_cache))
    return _taxonomy_cache


def _tokenize(text: str) -> Set[str]:
    """Split text into lowercase word tokens."""
    return set(re.findall(r"[a-zA-Z0-9#+.]+", text.lower()))


def extract_skills_simple(text: str) -> List[str]:
    """Extract skills by matching taxonomy entries against text tokens using strict boundaries."""
    taxonomy = load_taxonomy()
    if not taxonomy:
        return []
    text_lower = text.lower()
    found = []
    for skill in taxonomy:
        # Use boundary regex: skill must not be preceded by alphanumeric/special char
        # and must not be followed by alphabetic or special char
        pattern = r"(?<![a-zA-Z0-9#+])" + re.escape(skill) + r"(?![a-zA-Z#+])"
        if re.search(pattern, text_lower):
            found.append(skill)
    return sorted(set(found))


def extract_skills_from_jd(text: str) -> Tuple[List[str], List[str]]:
    """Extract required and preferred skills from a JD text."""
    text_lower = text.lower()
    all_skills = extract_skills_simple(text)

    preferred_markers = ["nice to have", "preferred", "bonus", "plus", "desired"]
    preferred = []
    required = []

    for skill in all_skills:
        is_preferred = False
        for marker in preferred_markers:
            if marker in text_lower:
                idx_marker = text_lower.find(marker)
                idx_skill = text_lower.find(skill)
                if idx_skill > idx_marker:
                    is_preferred = True
                    break
        if is_preferred:
            preferred.append(skill)
        else:
            required.append(skill)

    return required, preferred
