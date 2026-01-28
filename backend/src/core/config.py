"""Environment configuration using pydantic-settings."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
