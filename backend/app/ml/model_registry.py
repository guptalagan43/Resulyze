import logging
from app.config import settings

logger = logging.getLogger(__name__)

class ModelRegistry:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.nlp = None
            cls._instance.embedder = None
            cls._instance.reranker = None
        return cls._instance

    def load_all(self):
        try:
            import joblib
            self.reranker = joblib.load(settings.RERANKER_MODEL_PATH)
            logger.info("Reranker model loaded from %s", settings.RERANKER_MODEL_PATH)
        except Exception:
            logger.warning("Reranker model not found at %s — skipping", settings.RERANKER_MODEL_PATH)
            self.reranker = None

    def get_nlp(self):
        if self.nlp is None:
            try:
                import spacy
                self.nlp = spacy.load(settings.SPACY_MODEL_NAME)
            except Exception as exc:
                logger.warning("Failed to load spaCy model: %s", exc)
        return self.nlp

    def get_embedder(self):
        if self.embedder is None:
            try:
                from sentence_transformers import SentenceTransformer
                self.embedder = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            except Exception as exc:
                logger.warning("Failed to load sentence transformer: %s", exc)
        return self.embedder

_model_registry = ModelRegistry()

def get_registry():
    return _model_registry
