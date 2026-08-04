"""Resume parser — extracts raw text from PDF, DOCX, and TXT files."""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF using PyMuPDF."""
    import fitz  # PyMuPDF

    text_parts = []
    with fitz.open(file_path) as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts).strip()


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX using python-docx."""
    from docx import Document

    doc = Document(file_path)
    return "\n".join(p.text for p in doc.paragraphs).strip()


def extract_text_from_txt(file_path: str) -> str:
    """Read plain text from a TXT file."""
    return Path(file_path).read_text(encoding="utf-8", errors="ignore").strip()


def extract_text(file_path: str) -> str:
    """Route to the correct parser based on file extension."""
    suffix = Path(file_path).suffix.lower()
    parsers = {
        ".pdf": extract_text_from_pdf,
        ".docx": extract_text_from_docx,
        ".txt": extract_text_from_txt,
    }
    parser = parsers.get(suffix)
    if parser is None:
        raise ValueError(f"Unsupported file type: {suffix}")
    try:
        return parser(file_path)
    except Exception as exc:
        logger.error("Failed to parse %s: %s", file_path, exc)
        raise
