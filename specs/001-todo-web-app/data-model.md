# Data Model: Todo Backend

**Feature**: Todo Full-Stack Web Application (Backend)
**Date**: 2026-01-16
**Phase**: Phase 1 - Data Model Design

## Overview

This document defines the database schema for the todo backend application. The data model consists of two primary entities: **User** and **Todo**, with a one-to-many relationship (one user owns many todos).

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│      User       │         │      Todo       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │────────<│ id (PK)         │
│ email (UNIQUE)  │    1:N  │ title           │
│ hashed_password │         │ description     │
│ created_at      │         │ is_completed    │
│                 │         │ user_id (FK)    │
│                 │         │ created_at      │
│                 │         │ updated_at      │
└─────────────────┘         └─────────────────┘
```

## Entity Definitions

### 1. User Entity

**Purpose**: Represents an individual user account in the system. Each user can create and manage their own todos.

**Table Name**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the user |
| `email` | String(255) | UNIQUE, NOT NULL | User's email address (used for signin) |
| `hashed_password` | String(255) | NOT NULL | Bcrypt-hashed password (never store plaintext) |
| `created_at` | DateTime | NOT NULL, DEFAULT NOW() | Timestamp when user account was created |

**Indexes**:
- Primary key index on `id` (automatic)
- Unique index on `email` (for fast lookup during signin)

**Validation Rules** (enforced at API layer):
- Email must be valid format (RFC 5322)
- Email must be unique across all users
- Password must be at least 8 characters before hashing
- Password must be hashed using bcrypt before storage

**Security Considerations**:
- Never expose `hashed_password` in API responses
- Never log plaintext passwords
- Use constant-time comparison for password verification

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(max_length=255, unique=True, nullable=False, index=True)
    hashed_password: str = Field(max_length=255, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    todos: List["Todo"] = Relationship(back_populates="user", cascade_delete=True)
```

**API Response Schema** (excludes sensitive fields):
```python
class UserResponse(SQLModel):
    id: int
    email: str
    created_at: datetime
    # Note: hashed_password is NEVER included in responses
```

---

### 2. Todo Entity

**Purpose**: Represents a task item belonging to a specific user. Each todo has a title, optional description, and completion status.

**Table Name**: `todos`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for the todo |
| `title` | String(200) | NOT NULL | Todo title (required, max 200 characters) |
| `description` | String(1000) | NULLABLE | Optional detailed description (max 1000 characters) |
| `is_completed` | Boolean | NOT NULL, DEFAULT FALSE | Completion status (false = incomplete, true = complete) |
| `user_id` | Integer | FOREIGN KEY → users.id, NOT NULL | Owner of this todo (enforces data isolation) |
| `created_at` | DateTime | NOT NULL, DEFAULT NOW() | Timestamp when todo was created |
| `updated_at` | DateTime | NOT NULL, DEFAULT NOW() | Timestamp when todo was last modified |

**Indexes**:
- Primary key index on `id` (automatic)
- Foreign key index on `user_id` (for fast user-scoped queries)
- Composite index on `(user_id, created_at DESC)` (for efficient list queries)

**Validation Rules** (enforced at API layer):
- Title must not be empty or whitespace-only
- Title must be ≤ 200 characters
- Description must be ≤ 1000 characters (if provided)
- `user_id` must reference an existing user
- `is_completed` must be boolean (true/false)

**Business Rules**:
- Users can only access todos where `user_id` matches their authenticated user ID
- Deleting a user cascades to delete all their todos
- `updated_at` is automatically updated on any modification

**SQLModel Definition**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_completed: bool = Field(default=False, nullable=False)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship
    user: Optional[User] = Relationship(back_populates="todos")

    # Composite index for efficient user-scoped queries
    __table_args__ = (
        Index("ix_todos_user_created", "user_id", "created_at"),
    )
```

**API Request/Response Schemas**:
```python
# Create request (user_id is set from JWT, not from request body)
class TodoCreate(SQLModel):
    title: str = Field(max_length=200, min_length=1)
    description: Optional[str] = Field(default=None, max_length=1000)

# Update request (partial updates allowed)
class TodoUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=200, min_length=1)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_completed: Optional[bool] = None

# Response (includes all fields)
class TodoResponse(SQLModel):
    id: int
    title: str
    description: Optional[str]
    is_completed: bool
    user_id: int
    created_at: datetime
    updated_at: datetime
```

---

## Relationships

### User → Todo (One-to-Many)

**Relationship Type**: One user can have many todos (0..N)

**Foreign Key**: `todos.user_id` → `users.id`

**Cascade Behavior**:
- **ON DELETE CASCADE**: When a user is deleted, all their todos are automatically deleted
- **ON UPDATE CASCADE**: If a user's ID changes (unlikely), todo foreign keys are updated

**Query Patterns**:
```python
# Get all todos for a user
user = session.get(User, user_id)
todos = user.todos  # Uses relationship

# Or with explicit query
statement = select(Todo).where(Todo.user_id == user_id)
todos = session.exec(statement).all()

# Get user from todo
todo = session.get(Todo, todo_id)
owner = todo.user  # Uses relationship
```

**Enforcement**:
- Database enforces referential integrity via foreign key constraint
- API layer enforces user isolation by filtering all queries by authenticated user ID

---

## Data Isolation Strategy

**Constitutional Requirement**: Users must only see and modify their own data.

**Enforcement Mechanisms**:

1. **Database Level**:
   - Foreign key constraint ensures every todo belongs to a valid user
   - No database-level row-level security (RLS) needed for this simple schema

2. **API Level** (PRIMARY ENFORCEMENT):
   - All queries MUST include `WHERE user_id = <authenticated_user_id>`
   - All creates MUST set `user_id = <authenticated_user_id>`
   - All updates/deletes MUST verify ownership before execution

3. **Query Checklist**:
   ```python
   # ✅ CORRECT: List todos for authenticated user
   statement = select(Todo).where(Todo.user_id == current_user.id)
   todos = session.exec(statement).all()

   # ❌ WRONG: List all todos (exposes other users' data)
   statement = select(Todo)
   todos = session.exec(statement).all()

   # ✅ CORRECT: Get specific todo with ownership check
   todo = session.get(Todo, todo_id)
   if todo.user_id != current_user.id:
       raise HTTPException(status_code=403, detail="Forbidden")

   # ❌ WRONG: Get todo without ownership check
   todo = session.get(Todo, todo_id)
   return todo  # May expose another user's todo
   ```

---

## Migration Strategy

**Initial Setup** (Phase II):
- Use `SQLModel.metadata.create_all(engine)` on application startup
- Idempotent operation (safe to run multiple times)
- No migration framework needed for initial schema

**Future Migrations** (Post-Phase II):
- Use Alembic for schema changes
- Generate migrations from SQLModel changes
- Apply migrations before application startup

**Rollback Strategy**:
- For Phase II: Drop and recreate tables (acceptable for hackathon)
- For production: Use Alembic downgrade migrations

---

## Performance Considerations

### Indexes

**Primary Indexes** (automatic):
- `users.id` (primary key)
- `todos.id` (primary key)

**Secondary Indexes** (explicit):
- `users.email` (unique index for signin lookup)
- `todos.user_id` (foreign key index for user-scoped queries)
- `todos.(user_id, created_at)` (composite index for sorted list queries)

### Query Optimization

**List Todos** (most common query):
```sql
SELECT * FROM todos
WHERE user_id = ?
ORDER BY created_at DESC;
```
- Uses composite index `(user_id, created_at)`
- Expected performance: <10ms for 1000 todos per user

**Get Todo by ID**:
```sql
SELECT * FROM todos WHERE id = ?;
```
- Uses primary key index
- Expected performance: <5ms

**Signin Lookup**:
```sql
SELECT * FROM users WHERE email = ?;
```
- Uses unique index on email
- Expected performance: <5ms

### Scalability

**Current Design** (Phase II):
- Supports 10-50 concurrent users
- Handles 1000+ todos per user efficiently
- No caching needed (database queries are fast enough)

**Future Optimizations** (if needed):
- Add Redis caching for frequently accessed todos
- Implement pagination for large todo lists
- Add database read replicas for read-heavy workloads

---

## Data Integrity Constraints

### Database Constraints

1. **Primary Keys**: Ensure unique identification
2. **Foreign Keys**: Ensure referential integrity (todos belong to valid users)
3. **Unique Constraints**: Prevent duplicate emails
4. **NOT NULL Constraints**: Ensure required fields are always present
5. **Check Constraints** (if supported): Validate data ranges

### Application-Level Validation

1. **Email Format**: Validated by Pydantic before database insert
2. **Password Strength**: Minimum 8 characters, validated before hashing
3. **Title Length**: 1-200 characters, validated by Pydantic
4. **Description Length**: 0-1000 characters, validated by Pydantic
5. **User Ownership**: Verified before all update/delete operations

---

## Security Considerations

### Password Storage

- **NEVER** store plaintext passwords
- Use bcrypt with default work factor (12 rounds)
- Hash passwords before inserting into database
- Verify passwords using constant-time comparison

### User Data Isolation

- **ALWAYS** filter queries by authenticated user ID
- **NEVER** expose other users' data in API responses
- **ALWAYS** verify ownership before update/delete operations
- Return 403 Forbidden for ownership violations

### SQL Injection Prevention

- Use parameterized queries (SQLModel handles this automatically)
- Never concatenate user input into SQL strings
- Validate all input at API layer with Pydantic

---

## Testing Strategy

### Unit Tests

- Test model validation (field constraints, types)
- Test relationship loading (user.todos, todo.user)
- Test cascade delete behavior

### Integration Tests

- Test user creation and signin
- Test todo CRUD operations with user isolation
- Test ownership verification (403 errors)
- Test concurrent user operations

### Data Integrity Tests

- Test foreign key constraints
- Test unique email constraint
- Test NOT NULL constraints
- Test cascade delete behavior

---

## Summary

**Entities**: 2 (User, Todo)
**Relationships**: 1 (User → Todo, one-to-many)
**Tables**: 2 (users, todos)
**Indexes**: 4 (2 primary keys, 1 unique, 1 composite)
**Foreign Keys**: 1 (todos.user_id → users.id)

**Key Design Decisions**:
1. Simple normalized schema (3NF)
2. User isolation enforced at API layer
3. Cascade delete for user → todos
4. Composite index for efficient sorted queries
5. Bcrypt password hashing
6. No soft deletes (hard deletes only)

**Next Steps**:
- Generate OpenAPI contracts for API endpoints
- Create quickstart documentation for setup
- Update agent context with data model
