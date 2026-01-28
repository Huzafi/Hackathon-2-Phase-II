# Research: Todo Backend Technology Integration

**Feature**: Todo Full-Stack Web Application (Backend)
**Date**: 2026-01-16
**Phase**: Phase 0 - Research & Technology Patterns

## Overview

This document consolidates research findings for integrating FastAPI, SQLModel, Neon Serverless PostgreSQL, and Better Auth JWT into a secure, multi-user todo backend application.

## 1. FastAPI + SQLModel Integration Pattern

### Decision: Use SQLModel for ORM and Pydantic Schemas

**Rationale**: SQLModel combines SQLAlchemy ORM with Pydantic validation, providing:
- Single model definition for both database and API schemas
- Automatic validation and serialization
- Type safety with Python type hints
- Reduced code duplication

**Pattern**:
```python
# models/todo.py
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_completed: bool = Field(default=False)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: Optional["User"] = Relationship(back_populates="todos")
```

**Alternatives Considered**:
- Pure SQLAlchemy + separate Pydantic models: Rejected due to code duplication
- Django ORM: Rejected as it requires full Django framework

## 2. Neon Serverless PostgreSQL Connection Management

### Decision: Use SQLModel Session with Connection Pooling

**Rationale**: Neon Serverless PostgreSQL requires:
- Connection pooling for serverless environments
- Automatic reconnection on connection loss
- Efficient resource usage (connections are expensive in serverless)

**Pattern**:
```python
# core/database.py
from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.pool import NullPool
import os

DATABASE_URL = os.getenv("DATABASE_URL")

# Use NullPool for serverless (Neon handles pooling)
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL logging in dev
    poolclass=NullPool,  # Neon handles connection pooling
    connect_args={
        "connect_timeout": 10,
        "options": "-c timezone=utc"
    }
)

def create_db_and_tables():
    """Create all tables. Run once on startup."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for FastAPI routes."""
    with Session(engine) as session:
        yield session
```

**Best Practices**:
- Use `NullPool` to avoid client-side connection pooling (Neon handles this)
- Set connection timeout to prevent hanging requests
- Use context manager (`with Session()`) for automatic cleanup
- Create tables on application startup (idempotent operation)

**Alternatives Considered**:
- SQLAlchemy async engine: Rejected for simplicity (sync is sufficient for hackathon scope)
- Manual connection management: Rejected due to complexity and error-proneness

## 3. Better Auth JWT Integration with FastAPI

### Decision: JWT Token Verification via Dependency Injection

**Rationale**: Better Auth issues JWT tokens on signin. Backend must:
- Verify JWT signature using shared secret
- Extract user ID from token payload
- Inject authenticated user into route handlers

**Pattern**:
```python
# core/security.py
from jose import JWTError, jwt
from fastapi import HTTPException, status
import os

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

def verify_jwt_token(token: str) -> dict:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# dependencies/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from core.security import verify_jwt_token
from core.database import get_session
from models.user import User

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Extract and verify JWT, return authenticated user."""
    token = credentials.credentials
    payload = verify_jwt_token(token)

    user_id = payload.get("sub")  # Better Auth uses 'sub' for user ID
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user = session.get(User, int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
```

**Usage in Routes**:
```python
# api/todos.py
from fastapi import APIRouter, Depends
from dependencies.auth import get_current_user
from models.user import User

router = APIRouter()

@router.get("/todos")
def list_todos(current_user: User = Depends(get_current_user)):
    # current_user is automatically injected and verified
    # All queries MUST filter by current_user.id
    pass
```

**Best Practices**:
- Use `python-jose` library for JWT verification
- Store JWT secret in environment variable
- Use FastAPI dependency injection for authentication
- Return 401 for invalid/missing tokens
- Extract user from database after token verification (ensures user still exists)

**Alternatives Considered**:
- Manual token parsing in each route: Rejected due to code duplication
- Session-based auth: Rejected per constitutional requirement (stateless API)

## 4. Password Hashing Best Practices

### Decision: Use bcrypt via passlib

**Rationale**: Passwords must never be stored in plaintext. bcrypt provides:
- Adaptive hashing (configurable work factor)
- Built-in salt generation
- Industry-standard security

**Pattern**:
```python
# core/security.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)
```

**Best Practices**:
- Hash passwords before storing in database
- Never log or expose plaintext passwords
- Use constant-time comparison (passlib handles this)
- Validate password strength before hashing (min 8 characters)

**Alternatives Considered**:
- argon2: Rejected for simplicity (bcrypt is sufficient)
- SHA256: Rejected (not designed for password hashing)

## 5. Error Handling Strategy

### Decision: HTTP Status Code Taxonomy

**Rationale**: Consistent error responses improve API usability and debugging.

**Status Code Usage**:
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST (resource created)
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid request body or parameters
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Valid token but insufficient permissions (e.g., accessing another user's todo)
- **404 Not Found**: Resource does not exist
- **422 Unprocessable Entity**: Validation errors (FastAPI default)
- **500 Internal Server Error**: Unexpected server errors

**Pattern**:
```python
# api/todos.py
from fastapi import HTTPException, status

@router.get("/todos/{todo_id}")
def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    todo = session.get(Todo, todo_id)

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )

    if todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this todo"
        )

    return todo
```

**Best Practices**:
- Always check resource existence (404)
- Always verify ownership (403)
- Provide descriptive error messages
- Use FastAPI's HTTPException for consistent responses

## 6. User-Scoped Query Pattern

### Decision: Always Filter by user_id

**Rationale**: Multi-user data isolation is a constitutional requirement. Every query must include user ID filter.

**Pattern**:
```python
# api/todos.py
from sqlmodel import select

@router.get("/todos")
def list_todos(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # CRITICAL: Always filter by current_user.id
    statement = select(Todo).where(Todo.user_id == current_user.id)
    todos = session.exec(statement).all()
    return todos

@router.post("/todos")
def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # CRITICAL: Always set user_id to current_user.id
    todo = Todo(**todo_data.dict(), user_id=current_user.id)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo
```

**Enforcement Checklist**:
- ✅ List queries: `WHERE user_id = current_user.id`
- ✅ Get by ID: Verify `todo.user_id == current_user.id` after fetch
- ✅ Create: Set `user_id = current_user.id` before insert
- ✅ Update: Verify ownership before update
- ✅ Delete: Verify ownership before delete

## 7. Testing Strategy

### Decision: pytest with TestClient and Test Database

**Rationale**: FastAPI provides TestClient for synchronous testing. Use in-memory SQLite for fast tests.

**Pattern**:
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.pool import StaticPool

from src.main import app
from src.core.database import get_session

# In-memory SQLite for tests
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
```

**Test Structure**:
- Unit tests: Individual functions (password hashing, JWT verification)
- Integration tests: API endpoints with database
- Contract tests: Validate OpenAPI schema compliance

**Best Practices**:
- Use fixtures for test database and client
- Test authentication flows (signup, signin, protected endpoints)
- Test user isolation (user A cannot access user B's todos)
- Test error cases (401, 403, 404)

## 8. Environment Configuration

### Decision: Use pydantic-settings for Type-Safe Config

**Pattern**:
```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

**Required Environment Variables**:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing/verification

**Best Practices**:
- Provide `.env.example` with dummy values
- Add `.env` to `.gitignore`
- Validate required variables on startup
- Use type hints for automatic validation

## Summary of Key Decisions

| Decision | Technology | Rationale |
|----------|-----------|-----------|
| ORM | SQLModel | Combines SQLAlchemy + Pydantic, reduces duplication |
| Database | Neon Serverless PostgreSQL | Serverless, auto-scaling, managed |
| Connection Pooling | NullPool (Neon-managed) | Neon handles pooling, avoid client-side pools |
| Authentication | Better Auth JWT | Stateless, industry-standard, frontend-compatible |
| Password Hashing | bcrypt (via passlib) | Adaptive, secure, industry-standard |
| Error Handling | HTTP status codes | 401 (unauthorized), 403 (forbidden), 404 (not found) |
| Testing | pytest + TestClient | Fast, synchronous, in-memory SQLite |
| Configuration | pydantic-settings | Type-safe, environment-based |

## Architectural Decisions Requiring ADR

Based on the three-part test (Impact + Alternatives + Scope):

1. **Database Schema Design (User-Todo Relationship)**
   - Impact: Long-term data model, affects all queries
   - Alternatives: Embedded todos in user document (NoSQL), separate ownership table
   - Scope: Cross-cutting, influences API design and security

2. **JWT-Based Authentication Strategy**
   - Impact: Stateless API, affects session management and scalability
   - Alternatives: Session-based auth, OAuth2 with refresh tokens
   - Scope: Cross-cutting, influences frontend integration and security

3. **Error Handling and HTTP Status Code Taxonomy**
   - Impact: API contract, affects client error handling
   - Alternatives: Custom error codes, GraphQL-style errors
   - Scope: Cross-cutting, influences API documentation and client integration

**Recommendation**: Document these decisions in ADRs after user consent.

## Next Steps (Phase 1)

1. Generate `data-model.md` with detailed entity definitions
2. Create OpenAPI contracts in `/contracts/` directory
3. Generate `quickstart.md` with setup instructions
4. Update agent context with technology stack
