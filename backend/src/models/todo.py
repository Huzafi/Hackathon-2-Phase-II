"""Todo database model."""
from sqlmodel import SQLModel, Field, Relationship, Index
from datetime import datetime
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User


class Todo(SQLModel, table=True):
    """Todo model for task management."""

    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_completed: bool = Field(default=False, nullable=False)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship to user (many todos belong to one user)
    user: Optional["User"] = Relationship(back_populates="todos")

    # Composite index for efficient user-scoped queries
    __table_args__ = (
        Index("ix_todos_user_created", "user_id", "created_at"),
    )
