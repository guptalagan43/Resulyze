"""Application settings loaded from .env file."""

from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration read from environment variables."""

    DATABASE_URL: str = "sqlite:///./resume_analyzer.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_RESUMES: str = "resumes"
    MINIO_BUCKET_REPORTS: str = "reports"
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    SPACY_MODEL_NAME: str = "en_core_web_sm"
    RERANKER_MODEL_PATH: str = "app/ml/reranker_model/model.pkl"
    SKILL_TAXONOMY_PATH: str = "app/ml/skill_taxonomy/skills.json"
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    RANDOM_SEED: int = 42
    MAX_RESUME_SIZE_MB: int = 10
    AUTO_DELETE_RESUMES_DAYS: int = 30
    UPLOAD_DIR: str = "uploads"

    @property
    def allowed_origins_list(self) -> list[str]:
        """Return list of allowed CORS origins."""
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def upload_path(self) -> Path:
        """Return resolved upload directory path."""
        p = Path(self.UPLOAD_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def is_sqlite(self) -> bool:
        """Check if running with SQLite."""
        return self.DATABASE_URL.startswith("sqlite")

    class Config:
        env_file = ".env"


settings = Settings()
