"""Todo API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime
from ..core.database import get_session
from ..dependencies.auth import get_current_user
from ..models.user import User
from ..models.todo import Todo
from ..schemas.todo import TodoCreate, TodoUpdate, TodoPatch, TodoResponse


router = APIRouter(prefix="/api/todos", tags=["Todos"])


def verify_todo_ownership(todo: Todo, current_user: User):
    """
    Verify that the current user owns the todo.

    Raises:
        HTTPException: 403 if user doesn't own the todo
    """
    if todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this todo"
        )


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new todo for the authenticated user.

    - Title is required (1-200 characters)
    - Description is optional (max 1000 characters)
    - User ID is automatically set from JWT token
    - Returns created todo with timestamps
    """
    # Validate title is not empty or whitespace
    if not todo_data.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title cannot be empty or whitespace"
        )

    # Create new todo with user_id from authenticated user
    new_todo = Todo(
        title=todo_data.title,
        description=todo_data.description,
        user_id=current_user.id
    )

    session.add(new_todo)
    session.commit()
    session.refresh(new_todo)

    return TodoResponse.model_validate(new_todo)


@router.get("", response_model=list[TodoResponse])
def list_todos(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    List all todos for the authenticated user.

    - Returns todos in reverse chronological order (newest first)
    - Only returns todos belonging to the authenticated user
    - User isolation enforced at query level
    """
    # CRITICAL: Always filter by current_user.id
    statement = select(Todo).where(Todo.user_id == current_user.id).order_by(Todo.created_at.desc())
    todos = session.exec(statement).all()

    return [TodoResponse.model_validate(todo) for todo in todos]


@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific todo by ID.

    - Requires authentication
    - Verifies ownership (403 if not owned by user)
    - Returns 404 if todo doesn't exist
    """
    todo = session.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )

    # Verify ownership
    verify_todo_ownership(todo, current_user)

    return TodoResponse.model_validate(todo)


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update a todo (full update - replaces all fields).

    - Requires authentication
    - Verifies ownership (403 if not owned by user)
    - Updates all provided fields
    - Automatically updates updated_at timestamp
    """
    todo = session.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )

    # Verify ownership
    verify_todo_ownership(todo, current_user)

    # Validate title is not empty
    if not todo_data.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title cannot be empty or whitespace"
        )

    # Update fields
    todo.title = todo_data.title
    todo.description = todo_data.description
    if todo_data.is_completed is not None:
        todo.is_completed = todo_data.is_completed
    todo.updated_at = datetime.utcnow()

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return TodoResponse.model_validate(todo)


@router.patch("/{todo_id}", response_model=TodoResponse)
def patch_todo(
    todo_id: int,
    todo_data: TodoPatch,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Partially update a todo (only updates provided fields).

    - Requires authentication
    - Verifies ownership (403 if not owned by user)
    - Updates only the fields provided in request
    - Automatically updates updated_at timestamp
    """
    todo = session.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )

    # Verify ownership
    verify_todo_ownership(todo, current_user)

    # Update only provided fields
    if todo_data.title is not None:
        if not todo_data.title.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title cannot be empty or whitespace"
            )
        todo.title = todo_data.title

    if todo_data.description is not None:
        todo.description = todo_data.description

    if todo_data.is_completed is not None:
        todo.is_completed = todo_data.is_completed

    todo.updated_at = datetime.utcnow()

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return TodoResponse.model_validate(todo)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Permanently delete a todo.

    - Requires authentication
    - Verifies ownership (403 if not owned by user)
    - Hard delete (cannot be recovered)
    - Returns 204 No Content on success
    """
    todo = session.get(Todo, todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )

    # Verify ownership
    verify_todo_ownership(todo, current_user)

    session.delete(todo)
    session.commit()

    return None
