# Data Model: Authentication and API Security

**Feature**: 002-auth-api-security
**Date**: 2026-01-19
**Purpose**: Define data entities and relationships for user authentication

---

## Entity: User

### Description
Represents a registered user account in the multi-user todo application. Each user has unique credentials and owns a collection of tasks that only they can access.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer (Primary Key) | NOT NULL, AUTO_INCREMENT | Unique user identifier |
| email | String (255) | NOT NULL, UNIQUE | User's email address (used for sign-in) |
| password_hash | String (255) | NOT NULL | bcrypt-hashed password (never store plaintext) |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | DateTime | NOT NULL, DEFAULT NOW() | Last modification timestamp |

### Indexes

- **Primary Key**: `id` (clustered index for fast lookups)
- **Unique Index**: `email` (enforces uniqueness, enables fast email-based queries)

### Relationships

- **One-to-Many with Todo**: A user owns zero or more todos
  - Foreign key: `Todo.user_id` references `User.id`
  - Cascade behavior: ON DELETE CASCADE (deleting user deletes all their todos)

### Validation Rules

From functional requirements (FR-002, FR-003):

1. **Email Validation**:
   - Must conform to RFC 5322 email format
   - Must be unique across all users
   - Case-insensitive comparison (normalize to lowercase before storage)
   - Example valid: `user@example.com`, `test.user+tag@domain.co.uk`
   - Example invalid: `invalid-email`, `@example.com`, `user@`

2. **Password Requirements** (enforced before hashing):
   - Minimum 8 characters
   - At least one uppercase letter (A-Z)
   - At least one lowercase letter (a-z)
   - At least one digit (0-9)
   - At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
   - Maximum 128 characters (prevent DoS via excessive hashing)

3. **Password Hashing**:
   - Algorithm: bcrypt
   - Cost factor: 12
   - Salt: Automatically generated per password
   - Output length: 60 characters (bcrypt standard)

### SQLModel Definition

```python
# backend/app/auth/models.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    """User account for authentication and task ownership"""
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="User's email address (unique identifier)"
    )
    password_hash: str = Field(
        max_length=255,
        description="bcrypt-hashed password (never store plaintext)"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last modification timestamp"
    )

    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "password_hash": "$2b$12$...",  # bcrypt hash
                "created_at": "2026-01-19T10:30:00Z",
                "updated_at": "2026-01-19T10:30:00Z"
            }
        }
```

### Pydantic Schemas (Request/Response)

```python
# backend/app/auth/schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
import re

class SignupRequest(BaseModel):
    """User registration request"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (min 8 chars, must include uppercase, lowercase, digit, special char)"
    )

    @validator("password")
    def validate_password_strength(cls, v):
        """Enforce password complexity requirements (FR-003)"""
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }

class SigninRequest(BaseModel):
    """User sign-in request"""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }

class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    expires_in: int = Field(default=3600, description="Token expiration in seconds (1 hour)")

    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 3600
            }
        }

class UserResponse(BaseModel):
    """User information response (excludes password_hash)"""
    id: int
    email: str
    created_at: datetime

    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "created_at": "2026-01-19T10:30:00Z"
            }
        }
```

### State Transitions

User accounts have a simple lifecycle:

1. **Created** → User registers via `/auth/signup`
   - Email and password validated
   - Password hashed with bcrypt
   - User record inserted into database
   - JWT token issued

2. **Active** → User signs in via `/auth/signin`
   - Credentials verified against stored hash
   - Fresh JWT token issued
   - User can access protected resources

3. **Token Expired** → JWT token expires after 1 hour
   - User receives 401 Unauthorized on API requests
   - Must sign in again to obtain new token

4. **Deleted** (future feature) → User account removed
   - All associated todos deleted (CASCADE)
   - JWT tokens become invalid (user_id no longer exists)

### Security Considerations

1. **Password Storage**:
   - NEVER store plaintext passwords
   - NEVER log passwords (even in error messages)
   - Hash passwords immediately upon receipt
   - Use bcrypt with cost factor 12 (OWASP recommendation)

2. **Email Uniqueness**:
   - Enforce at database level (UNIQUE constraint)
   - Normalize to lowercase before storage
   - Return consistent error message to prevent user enumeration

3. **User Enumeration Prevention**:
   - Sign-in errors: "Invalid credentials" (don't reveal if email exists)
   - Signup errors: "Email already registered" (acceptable for UX)

4. **Data Isolation**:
   - User ID extracted from JWT token (not from request body)
   - All queries filtered by authenticated user_id
   - Prevents users from accessing other users' data

### Migration Script

```sql
-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on email for fast lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Test Data (for development only)

```python
# backend/tests/fixtures.py
import pytest
from app.auth.service import hash_password

@pytest.fixture
def test_user_data():
    """Test user credentials (DO NOT use in production)"""
    return {
        "email": "test@example.com",
        "password": "TestPass123!",
        "password_hash": hash_password("TestPass123!")
    }

@pytest.fixture
def test_user_2_data():
    """Second test user for isolation testing"""
    return {
        "email": "test2@example.com",
        "password": "TestPass456!",
        "password_hash": hash_password("TestPass456!")
    }
```

---

## Summary

The User entity is the foundation of the authentication system. It stores user credentials securely (hashed passwords), enforces uniqueness (email), and establishes ownership relationships with todos. All validation rules from the specification (FR-002, FR-003, FR-004) are implemented at both the Pydantic schema level (request validation) and the database level (constraints).

**Key Design Decisions**:
- Integer primary key (simple, performant)
- Email as unique identifier (user-friendly)
- bcrypt password hashing (industry standard)
- Timestamps for audit trail
- Cascade delete for data cleanup
- Pydantic validators for password complexity
