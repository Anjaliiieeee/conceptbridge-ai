from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings
from app.core.logging_config import logger

# Build engine with appropriate dialect configurations
connect_args = {}
engine_kwargs = {}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    engine_kwargs = {
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    }

try:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        **engine_kwargs,
    )
except Exception as e:
    logger.error(f"Failed to initialize database engine for {settings.DATABASE_URL}: {e}")
    # Fallback to local SQLite if postgres URL was configured but service is unavailable locally
    logger.warning("Falling back to local SQLite database: sqlite:///./conceptbridge.db")
    engine = create_engine("sqlite:///./conceptbridge.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_db_and_tables():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)
