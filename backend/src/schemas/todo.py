"""Todo request and response schemas."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TodoCreate(BaseModel):
    """Request schema for creating a new todo."""
    title: str = Field(..., min_length=1, max_length=200, description="Todo title")
    description: Optional[str] = Field(None, max_length=1000, description="Optional description")


class TodoUpdate(BaseModel):
    """Request schema for full todo update (PUT)."""
    title: str = Field(..., min_length=1, max_length=200, description="Todo title")
    description: Optional[str] = Field(None, max_length=1000, description="Optional description")
    is_completed: Optional[bool] = Field(None, description="Completion status")


class TodoPatch(BaseModel):
    """Request schema for partial todo update (PATCH)."""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Todo title")
    description: Optional[str] = Field(None, max_length=1000, description="Optional description")
    is_completed: Optional[bool] = Field(None, description="Completion status")


class TodoResponse(BaseModel):
    """Response schema for todo data."""
    id: int
    title: str
    description: Optional[str]
    is_completed: bool
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
