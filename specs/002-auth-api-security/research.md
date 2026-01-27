# Research & Technical Decisions: Authentication and API Security

**Feature**: 002-auth-api-security
**Date**: 2026-01-19
**Purpose**: Document technical decisions and research findings for JWT-based authentication implementation

---

## 1. Better Auth JWT Configuration

### Decision
Use Better Auth in **JWT mode** with custom configuration to issue stateless JWT tokens instead of session cookies.

### Rationale
- Better Auth supports multiple authentication strategies including JWT
- JWT mode aligns with stateless authentication requirement (FR-018)
- Allows frontend to manage token storage and transmission
- Enables backend to verify tokens without database lookups

### Configuration Approach
```typescript
// frontend/app/lib/auth.ts
import { betterAuth } from "better-auth/client"

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  mode: "jwt", // Enable JWT mode
  storage: {
    type: "localStorage", // Store tokens client-side
    key: "auth_token"
  },
  jwt: {
    algorithm: "HS256",
    expiresIn: "1h",
    secret: process.env.JWT_SECRET // Shared with backend
  }
})
```

### Alternatives Considered
- **Session-based auth**: Rejected because requires server-side session storage (violates FR-018)
- **Custom JWT implementation**: Rejected because Better Auth is mandated by constraints
- **OAuth2 providers**: Out of scope per specification

---

## 2. JWT Payload Structure

### Decision
JWT payload will contain the following fields:

```json
{
  "sub": "user_id",           // Subject: unique user identifier (UUID or int)
  "email": "user@example.com", // User email address
  "iat": 1705680000,          // Issued at timestamp (Unix epoch)
  "exp": 1705683600,          // Expiration timestamp (iat + 1 hour)
  "type": "access"            // Token type identifier
}
```

### Rationale
- **sub (subject)**: Standard JWT claim for user identification; backend extracts this for database filtering (FR-014, FR-015)
- **email**: Included for convenience and debugging; not used for authorization
- **iat (issued at)**: Standard JWT claim for token age verification
- **exp (expiration)**: Standard JWT claim; enforces 1-hour expiration (FR-010)
- **type**: Distinguishes access tokens from potential future refresh tokens

### Backend Extraction Strategy
```python
# backend/app/core/security.py
from jose import jwt, JWTError

def get_current_user_id(token: str) -> int:
    """Extract user ID from JWT token for database filtering"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Alternatives Considered
- **Including user roles**: Out of scope (no RBAC in MVP)
- **Including permissions**: Out of scope (no fine-grained permissions)
- **Refresh tokens**: Out of scope per specification

---

## 3. FastAPI JWT Middleware

### Decision
Implement JWT verification as **FastAPI dependency** using `Depends()` pattern, not global middleware.

### Rationale
- Allows selective application to protected endpoints only
- Excludes /auth/signup and /auth/signin from authentication (FR-012)
- Provides clean dependency injection for user_id extraction
- Standard FastAPI pattern for authentication

### Implementation Pattern
```python
# backend/app/core/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """Dependency that verifies JWT and returns user ID"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# Usage in protected endpoints
@router.get("/todos")
async def get_todos(user_id: int = Depends(get_current_user_id)):
    # user_id automatically extracted from JWT
    return db.query(Todo).filter(Todo.user_id == user_id).all()
```

### Alternatives Considered
- **Global middleware**: Rejected because would require complex exclusion logic for /auth/* endpoints
- **Manual token parsing in each endpoint**: Rejected due to code duplication and error-proneness
- **Third-party auth libraries (Authlib, FastAPI-Users)**: Rejected to maintain simplicity and control

---

## 4. Frontend Token Storage

### Decision
Store JWT tokens in **localStorage** with automatic attachment to API requests.

### Rationale
- Persists across browser sessions (better UX than sessionStorage)
- Accessible to JavaScript for API request attachment
- Better Auth default storage mechanism
- Acceptable security trade-off for hackathon MVP

### Security Considerations
- **XSS Risk**: Tokens in localStorage are vulnerable to XSS attacks
- **Mitigation**: Next.js App Router provides built-in XSS protection; no user-generated HTML rendering
- **Production Recommendation**: Consider httpOnly cookies for production deployment (out of scope for MVP)

### Implementation
```typescript
// frontend/app/lib/api-client.ts
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token")

  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  if (response.status === 401) {
    // Token expired or invalid - redirect to signin
    localStorage.removeItem("auth_token")
    window.location.href = "/auth/signin"
  }

  return response
}
```

### Alternatives Considered
- **sessionStorage**: Rejected because tokens would be lost on browser close (poor UX)
- **httpOnly cookies**: Rejected because requires session-based auth (violates stateless requirement)
- **IndexedDB**: Rejected as unnecessarily complex for simple token storage

---

## 5. Token Attachment Strategy

### Decision
Create centralized **API client wrapper** that automatically attaches JWT tokens to all requests.

### Rationale
- Single source of truth for API communication
- Automatic token attachment eliminates manual header management
- Centralized error handling for 401 responses
- Easy to test and maintain

### Implementation Pattern
```typescript
// frontend/app/lib/api-client.ts
class ApiClient {
  private baseURL: string
  private getToken: () => string | null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.getToken = () => localStorage.getItem("auth_token")
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...options.headers
      }
    })

    if (response.status === 401) {
      localStorage.removeItem("auth_token")
      window.location.href = "/auth/signin"
      throw new Error("Unauthorized")
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" })
  }

  post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data)
    })
  }

  // ... put, delete methods
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL!)
```

### Alternatives Considered
- **Manual header attachment**: Rejected due to code duplication and error-proneness
- **Axios interceptors**: Rejected to minimize dependencies (fetch is built-in)
- **React Query with auth**: Deferred to future iteration (out of scope for MVP)

---

## 6. Cross-Origin Configuration (CORS)

### Decision
Configure FastAPI CORS middleware to allow frontend origin with credentials.

### Rationale
- Frontend and backend run on different ports/domains during development
- JWT tokens transmitted via Authorization header require CORS configuration
- Must allow credentials for potential future cookie-based auth

### Implementation
```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",  # Alternative port
        # Add production frontend URL in production .env
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["Authorization"]
)
```

### Security Considerations
- **Development**: Localhost origins only
- **Production**: Must restrict to actual frontend domain (configured via environment variable)
- **Wildcard origins**: Never use "*" with allow_credentials=True (security violation)

### Alternatives Considered
- **No CORS**: Rejected because frontend and backend are separate services
- **Proxy configuration**: Rejected as unnecessarily complex for development
- **Same-origin deployment**: Out of scope (requires infrastructure changes)

---

## 7. Password Hashing

### Decision
Use **passlib with bcrypt** algorithm and cost factor 12.

### Rationale
- bcrypt is industry-standard for password hashing (FR-004)
- Cost factor 12 balances security and performance (OWASP recommendation)
- passlib provides clean API and supports multiple algorithms
- Built-in salt generation prevents rainbow table attacks

### Implementation
```python
# backend/app/auth/service.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password using bcrypt with cost factor 12"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)
```

### Performance Considerations
- bcrypt cost factor 12: ~250ms per hash on modern hardware
- Acceptable for authentication endpoints (target: <2 seconds per FR-010)
- Prevents brute-force attacks through computational cost

### Alternatives Considered
- **argon2**: Rejected because bcrypt is more widely supported and sufficient for MVP
- **scrypt**: Rejected because bcrypt is industry standard
- **Plain SHA-256**: Rejected as insecure (no salt, too fast)

---

## 8. User ID Extraction and Database Filtering

### Decision
Extract user_id from JWT in FastAPI dependency, then use SQLModel ORM filtering.

### Rationale
- Dependency injection provides user_id to all protected endpoints
- SQLModel ORM ensures type-safe queries
- WHERE clause filtering enforces user isolation (FR-015)
- Prevents SQL injection through parameterized queries

### Implementation Pattern
```python
# backend/app/todos/router.py
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.core.security import get_current_user_id
from app.core.database import get_session

router = APIRouter()

@router.get("/todos")
async def get_todos(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get all todos for authenticated user"""
    statement = select(Todo).where(Todo.user_id == user_id)
    todos = session.exec(statement).all()
    return todos

@router.post("/todos")
async def create_todo(
    todo_data: TodoCreate,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Create todo for authenticated user"""
    todo = Todo(**todo_data.dict(), user_id=user_id)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@router.delete("/todos/{todo_id}")
async def delete_todo(
    todo_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Delete todo (verify ownership)"""
    statement = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == user_id  # Ownership verification
    )
    todo = session.exec(statement).first()

    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    session.delete(todo)
    session.commit()
    return {"message": "Todo deleted"}
```

### Security Guarantees
- **User isolation**: All queries filtered by authenticated user_id
- **Ownership verification**: DELETE/PUT operations verify user_id matches
- **403 vs 404**: Return 404 for non-existent or unauthorized resources (prevents information leakage)

### Alternatives Considered
- **Manual SQL queries**: Rejected due to SQL injection risk and lack of type safety
- **Row-level security (RLS)**: Deferred to future iteration (requires database-level configuration)
- **Separate user context**: Rejected as unnecessarily complex (dependency injection is sufficient)

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| Auth Library | Better Auth (JWT mode) | Mandated by constraints; supports stateless JWT |
| JWT Payload | `{sub, email, iat, exp, type}` | Standard claims + user identification |
| Backend Auth | FastAPI Depends() pattern | Selective endpoint protection, clean DI |
| Token Storage | localStorage | Persists across sessions, Better Auth default |
| Token Attachment | Centralized API client | Automatic attachment, centralized error handling |
| CORS | FastAPI middleware | Required for cross-origin JWT transmission |
| Password Hashing | passlib + bcrypt (cost 12) | Industry standard, OWASP recommended |
| User Filtering | SQLModel WHERE clauses | Type-safe, prevents SQL injection, enforces isolation |

**All research tasks resolved. Proceeding to Phase 1: Design & Contracts.**
