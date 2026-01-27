# Quickstart Guide: Authentication and API Security

**Feature**: 002-auth-api-security
**Date**: 2026-01-19
**Purpose**: Setup instructions for implementing JWT-based authentication

---

## Prerequisites

Before implementing this feature, ensure:

1. **Feature 001 (Todo Web App) is complete**:
   - Next.js frontend is set up and running
   - FastAPI backend is set up and running
   - Neon PostgreSQL database is accessible
   - Basic project structure exists

2. **Development environment**:
   - Node.js 18+ and npm/yarn installed
   - Python 3.11+ and pip installed
   - Git repository initialized
   - `.env` files configured (see below)

3. **Database access**:
   - Neon PostgreSQL connection string available
   - Database migrations can be run

---

## Environment Configuration

### Backend `.env`

Create or update `backend/.env`:

```bash
# Database (from Feature 001)
DATABASE_URL=postgresql://user:password@host/database

# JWT Configuration (NEW)
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1

# CORS (NEW)
FRONTEND_URL=http://localhost:3000
```

**CRITICAL**: Generate a strong JWT secret:
```bash
# Generate secure random secret (32 bytes)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Frontend `.env.local`

Create or update `frontend/.env.local`:

```bash
# API Configuration (from Feature 001)
NEXT_PUBLIC_API_URL=http://localhost:8000

# JWT Configuration (NEW - MUST match backend)
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
```

**CRITICAL**: `JWT_SECRET` must be **identical** in both frontend and backend.

---

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
pip install python-jose[cryptography] passlib[bcrypt]
pip freeze > requirements.txt
```

**Dependencies added**:
- `python-jose[cryptography]`: JWT encoding/decoding
- `passlib[bcrypt]`: Password hashing with bcrypt

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install better-auth
# or
yarn add better-auth
```

**Dependencies added**:
- `better-auth`: Authentication library with JWT support

### 3. Run Database Migration

Create users table:

```bash
cd backend

# Option 1: Using Alembic (if configured)
alembic revision --autogenerate -m "Add users table"
alembic upgrade head

# Option 2: Direct SQL (development only)
psql $DATABASE_URL -f ../specs/002-auth-api-security/migrations/001_create_users_table.sql
```

**Migration SQL** (save as `migrations/001_create_users_table.sql`):
```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

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

### 4. Verify Installation

**Backend**:
```bash
cd backend
python -c "from jose import jwt; from passlib.context import CryptContext; print('Dependencies OK')"
```

**Frontend**:
```bash
cd frontend
npm list better-auth
# Should show: better-auth@x.x.x
```

---

## Implementation Order

Follow this sequence to implement the feature:

### Phase 1: Backend Authentication Endpoints

1. **Create User model** (`backend/app/auth/models.py`)
   - SQLModel definition with email, password_hash, timestamps
   - See: `specs/002-auth-api-security/data-model.md`

2. **Create Pydantic schemas** (`backend/app/auth/schemas.py`)
   - SignupRequest, SigninRequest, TokenResponse
   - Password validation logic

3. **Create auth service** (`backend/app/auth/service.py`)
   - Password hashing functions
   - JWT token creation
   - User registration logic
   - User sign-in logic

4. **Create auth router** (`backend/app/auth/router.py`)
   - POST /auth/signup endpoint
   - POST /auth/signin endpoint
   - See: `specs/002-auth-api-security/contracts/auth-api.yaml`

5. **Register router** (`backend/app/main.py`)
   - Add auth router to FastAPI app
   - Configure CORS middleware

### Phase 2: Backend JWT Middleware

1. **Create security utilities** (`backend/app/core/security.py`)
   - JWT verification function
   - Token decoding function
   - get_current_user_id dependency

2. **Update existing endpoints** (e.g., `backend/app/todos/router.py`)
   - Add `user_id: int = Depends(get_current_user_id)` to protected endpoints
   - Filter queries by user_id: `WHERE Todo.user_id == user_id`

### Phase 3: Frontend Authentication Pages

1. **Configure Better Auth** (`frontend/app/lib/auth.ts`)
   - Initialize Better Auth with JWT mode
   - Configure token storage (localStorage)

2. **Create API client** (`frontend/app/lib/api-client.ts`)
   - Centralized HTTP client
   - Automatic token attachment
   - 401 error handling

3. **Create signup page** (`frontend/app/auth/signup/page.tsx`)
   - Registration form
   - Email and password validation
   - Error handling

4. **Create signin page** (`frontend/app/auth/signin/page.tsx`)
   - Sign-in form
   - Credential validation
   - Redirect to dashboard on success

### Phase 4: Testing

1. **Backend tests** (`backend/tests/`)
   - test_auth_signup.py: Registration flow
   - test_auth_signin.py: Sign-in flow
   - test_jwt_middleware.py: Token verification
   - test_user_isolation.py: Cross-user access prevention

2. **Frontend tests** (`frontend/tests/`)
   - signup.test.tsx: Registration UI
   - signin.test.tsx: Sign-in UI
   - api-client.test.ts: Token attachment

3. **Integration tests**:
   - End-to-end auth flow (signup → signin → protected resource)
   - Token expiration handling
   - Unauthorized access rejection

---

## Testing the Implementation

### Manual Testing

**1. Test User Registration**:
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Expected: 201 Created with JWT token
# {
#   "access_token": "eyJhbGci...",
#   "token_type": "bearer",
#   "expires_in": 3600
# }
```

**2. Test User Sign-In**:
```bash
curl -X POST http://localhost:8000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Expected: 200 OK with JWT token
```

**3. Test Protected Endpoint**:
```bash
# Get token from signup/signin response
TOKEN="eyJhbGci..."

curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with user's todos
```

**4. Test Unauthorized Access**:
```bash
curl -X GET http://localhost:8000/api/todos

# Expected: 401 Unauthorized
# {"detail": "Not authenticated"}
```

**5. Test Invalid Token**:
```bash
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized
# {"detail": "Invalid token"}
```

### Automated Testing

**Backend**:
```bash
cd backend
pytest tests/test_auth_signup.py -v
pytest tests/test_auth_signin.py -v
pytest tests/test_jwt_middleware.py -v
pytest tests/test_user_isolation.py -v
```

**Frontend**:
```bash
cd frontend
npm test -- auth/signup.test.tsx
npm test -- auth/signin.test.tsx
npm test -- lib/api-client.test.ts
```

---

## Verification Checklist

Before marking this feature complete, verify:

- [ ] Users can register with valid email and password
- [ ] Duplicate email registration is rejected
- [ ] Weak passwords are rejected with clear error messages
- [ ] Users can sign in with correct credentials
- [ ] Invalid credentials return 401 with consistent error message
- [ ] JWT tokens are issued on successful signup/signin
- [ ] JWT tokens contain correct payload (sub, email, iat, exp, type)
- [ ] Protected endpoints require valid JWT token
- [ ] Requests without token return 401
- [ ] Requests with invalid token return 401
- [ ] Requests with expired token return 401
- [ ] User ID is correctly extracted from JWT
- [ ] Database queries are filtered by authenticated user ID
- [ ] User A cannot access User B's data (returns 403 or 404)
- [ ] Frontend stores JWT token in localStorage
- [ ] Frontend automatically attaches token to API requests
- [ ] Frontend redirects to signin on 401 errors
- [ ] CORS is configured correctly (frontend can call backend)
- [ ] JWT secret is stored in .env (not hardcoded)
- [ ] .env files are excluded from version control

---

## Troubleshooting

### Issue: "Invalid token" errors

**Cause**: JWT secret mismatch between frontend and backend

**Solution**:
1. Verify `JWT_SECRET` is identical in both `.env` files
2. Restart both frontend and backend servers
3. Clear localStorage and re-authenticate

### Issue: "Email already registered" on first signup

**Cause**: User already exists in database from previous test

**Solution**:
```sql
-- Delete test users (development only)
DELETE FROM users WHERE email LIKE '%@example.com';
```

### Issue: CORS errors in browser console

**Cause**: Backend CORS middleware not configured

**Solution**:
1. Verify `FRONTEND_URL` in backend `.env`
2. Check CORS middleware in `backend/app/main.py`
3. Ensure `allow_credentials=True` is set

### Issue: Password validation not working

**Cause**: Pydantic validator not applied

**Solution**:
1. Check `@validator("password")` decorator in schemas.py
2. Verify regex patterns for uppercase, lowercase, digit, special char
3. Test with known valid password: `TestPass123!`

### Issue: Token expires too quickly

**Cause**: JWT_EXPIRATION_HOURS misconfigured

**Solution**:
1. Verify `JWT_EXPIRATION_HOURS=1` in backend `.env`
2. Check token creation logic uses correct expiration
3. Decode token at jwt.io to verify `exp` claim

---

## Next Steps

After completing this feature:

1. **Run `/sp.tasks`** to generate actionable task breakdown
2. **Run `/sp.implement`** to execute tasks using specialized agents
3. **Test thoroughly** using verification checklist above
4. **Document any deviations** from the plan in ADRs
5. **Create PR** with `/sp.git.commit_pr` when ready

---

## References

- **Specification**: `specs/002-auth-api-security/spec.md`
- **Implementation Plan**: `specs/002-auth-api-security/plan.md`
- **Research Decisions**: `specs/002-auth-api-security/research.md`
- **Data Model**: `specs/002-auth-api-security/data-model.md`
- **API Contracts**: `specs/002-auth-api-security/contracts/auth-api.yaml`
- **JWT Payload Schema**: `specs/002-auth-api-security/contracts/jwt-payload.json`

---

**Last Updated**: 2026-01-19
