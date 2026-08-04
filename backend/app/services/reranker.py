"""Reranker stub — falls back to weighted score when no XGBoost model is available."""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


def rerank_score(
    feature_vector: list,
    reranker_model,
) -> Optional[float]:
    """Predict final score using XGBoost reranker, or return None if no model."""
    if reranker_model is None:
        logger.debug("No reranker model loaded — using weighted score only")
        return None
    try:
        import numpy as np
        features = np.array([feature_vector])
        if hasattr(reranker_model, "predict_proba"):
            probs = reranker_model.predict_proba(features)[0]
            prediction = float(probs[1] * 100)
        else:
            prediction = float(reranker_model.predict(features)[0] * 100)
        return float(min(max(prediction, 0.0), 100.0))
    except Exception as exc:
        logger.error("Reranker prediction failed: %s", exc)
        return None
