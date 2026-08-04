"""Embedding service — generates 384-dim vectors using sentence-transformers."""

import logging

import numpy as np

logger = logging.getLogger(__name__)


def encode_text(text: str, embedder) -> np.ndarray:
    """Encode text into a 384-dimensional dense vector using sentence-transformers."""
    if embedder is None:
        logger.warning("No embedder available — returning zero vector")
        return np.zeros(384)
    return embedder.encode(text, convert_to_numpy=True, show_progress_bar=False)


def cosine_similarity(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors, returns 0.0-1.0."""
    dot = np.dot(vec_a, vec_b)
    norm_a = np.linalg.norm(vec_a)
    norm_b = np.linalg.norm(vec_b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))
