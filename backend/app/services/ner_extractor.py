"""NER extractor — uses spaCy + regex to extract structured fields from resume text."""

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"[\+]?[\d\s\-().]{7,15}")
EXPERIENCE_RE = re.compile(
    r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience)?",
    re.IGNORECASE,
)
DEGREE_KEYWORDS = [
    "phd", "ph.d", "doctorate",
    "master", "m.s.", "m.sc", "mba", "m.tech", "mtech",
    "bachelor", "b.s.", "b.sc", "b.tech", "btech", "b.e.",
    "associate", "diploma", "high school",
]


def extract_email(text: str) -> Optional[str]:
    """Extract the first email address from text."""
    match = EMAIL_RE.search(text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    """Extract the first phone number from text."""
    match = PHONE_RE.search(text)
    return match.group(0).strip() if match else None


def extract_experience_years(text: str) -> Optional[float]:
    """Extract years of experience from text using regex."""
    match = EXPERIENCE_RE.search(text)
    return float(match.group(1)) if match else None


def extract_education_level(text: str) -> Optional[str]:
    """Detect highest education level from keyword matching."""
    text_lower = text.lower()
    for keyword in DEGREE_KEYWORDS:
        if keyword in text_lower:
            return keyword.title()
    return None


def extract_name_spacy(text: str, nlp) -> Optional[str]:
    """Extract person name using spaCy NER on the first 500 chars."""
    doc = nlp(text[:500])
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return None


def extract_entities(text: str, nlp) -> dict:
    """Run full NER extraction pipeline and return structured data."""
    return {
        "name": extract_name_spacy(text, nlp),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "experience_years": extract_experience_years(text),
        "education_level": extract_education_level(text),
    }
