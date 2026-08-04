"""FastAPI app entry point — sets up routes, CORS, and dev-mode table creation."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1 import auth, resumes, jobs, analysis, analytics

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Resume Analyzer API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(resumes.router, prefix="/api/v1/resumes", tags=["resumes"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])


@app.on_event("startup")
def on_startup():
    """Create tables and load ML models on startup."""
    if settings.ENVIRONMENT == "development":
        from app.database import Base, engine
        import app.models  # noqa: F401 — triggers model registration
        Base.metadata.create_all(bind=engine)
        logger.info("Dev mode: tables created via create_all()")

    try:
        from app.ml.model_registry import get_registry
        registry = get_registry()
        registry.load_all()
        logger.info("ML model registry initialized successfully")
    except Exception as exc:
        logger.error("Failed to initialize ML models: %s", exc)
        logger.warning("Server running without ML models — some endpoints will fail")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}
