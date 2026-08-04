"""SQLAlchemy engine and session factory."""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

connect_args = {}
if settings.is_sqlite:
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
)
SessionLocal = sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""
    pass


def get_db():
    """Yield a DB session and close it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
