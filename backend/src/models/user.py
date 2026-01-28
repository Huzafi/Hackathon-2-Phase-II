"""User database model."""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .todo import Todo


class User(SQLModel, table=True):
    """User model for authentication and todo ownership."""

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True, nullable=False, index=True)
    hashed_password: str = Field(max_length=255, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship to todos (one user has many todos)
    todos: List["Todo"] = Relationship(back_populates="user")
