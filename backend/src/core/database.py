"""Database connection and session management."""
from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.pool import NullPool
from .config import settings


# Create engine with NullPool for serverless (Neon handles pooling)
engine = create_engine(
    settings.database_url,
    echo=False,  # Set to True for SQL logging in development
    poolclass=NullPool,  # Neon handles connection pooling
    connect_args={
        "connect_timeout": 10,
        "options": "-c timezone=utc"
    }
)


def create_db_and_tables():
    """Create all database tables. Idempotent operation."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency for database sessions."""
    with Session(engine) as session:
        yield session
