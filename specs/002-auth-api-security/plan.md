# Implementation Plan: Authentication and API Security

**Branch**: `002-auth-api-security` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-auth-api-security/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement secure user authentication using Better Auth with JWT tokens for a multi-user todo application. The system will enable user registration and sign-in flows in the Next.js frontend, issue JWT tokens containing user identity, and enforce stateless authentication in the FastAPI backend. All protected API endpoints will verify JWT signatures and extract user IDs to enforce strict data isolation, ensuring users can only access their own tasks.

**Technical Approach**: Better Auth handles frontend authentication and JWT issuance → JWT tokens transmitted via Authorization header → FastAPI middleware verifies signatures using shared secret → User ID extracted from token payload → All database queries filtered by authenticated user ID.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x with Next.js 16+ (App Router)
- Backend: Python 3.11+ with FastAPI (latest)

**Primary Dependencies**:
- Frontend: Better Auth SDK (JWT mode), Next.js 16+, React 19+
- Backend: FastAPI, python-jose[cryptography] or PyJWT, passlib[bcrypt], SQLModel
- Shared: JWT secret key (HS256 algorithm)

**Storage**: Neon Serverless PostgreSQL (existing from Feature 001)
- Users table: id (UUID/int), email (unique), password_hash, created_at
- JWT tokens: NOT stored (stateless authentication)

**Testing**:
- Frontend: Jest + React Testing Library (component tests)
- Backend: pytest + httpx (API endpoint tests)
- Integration: End-to-end auth flow tests (registration → sign-in → protected resource access)

**Target Platform**:
- Frontend: Web browsers (Chrome, Firefox, Safari, Edge) - desktop and mobile
- Backend: Linux server (containerized FastAPI application)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- JWT token verification: <50ms per request
- Authentication endpoints (signup/signin): <2 seconds response time
- Support 1000 concurrent authentication requests without failures

**Constraints**:
- Stateless authentication (no server-side session storage)
- JWT tokens expire after 1 hour (no refresh mechanism in MVP)
- All endpoints except /auth/signup and /auth/signin must require authentication
- Shared JWT secret must be identical in frontend and backend .env files
- Password hashing must use bcrypt with cost factor 12

**Scale/Scope**:
- Multi-user application (hundreds to thousands of users)
- 4 user stories (registration, sign-in, protected access, unauthorized handling)
- 2 new API endpoints (/auth/signup, /auth/signin)
- 1 middleware component (JWT verification)
- 2 frontend pages (signup, signin)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Spec-Driven Development (SDD)
- **Status**: PASS
- **Evidence**: Feature has documented spec.md with user stories, functional requirements, and acceptance criteria. This plan.md follows from spec. Tasks will be generated via /sp.tasks.

### ✅ II. Security-First Design
- **Status**: PASS
- **Evidence**:
  - All API endpoints (except /auth/signup, /auth/signin) will require JWT authentication (FR-012)
  - All database queries will filter by authenticated user ID (FR-015)
  - JWT secret stored in environment variables (FR-011)
  - User data isolation enforced (FR-015, FR-017)
  - Explicit HTTP status codes (401 for unauthorized, 403 for forbidden) (FR-016, FR-017)

### ✅ III. Zero Manual Coding
- **Status**: PASS
- **Evidence**: Implementation will use specialized agents:
  - `auth-specialist` for Better Auth integration and JWT handling
  - `fastapi-backend-dev` for backend authentication endpoints and middleware
  - `nextjs-frontend-builder` for signup/signin pages
  - `neon-db-specialist` for users table schema (if modifications needed)

### ✅ IV. Clear Separation of Concerns
- **Status**: PASS
- **Evidence**:
  - Frontend: Next.js App Router pages consume /auth/signup and /auth/signin REST APIs
  - Backend: FastAPI provides stateless JWT-secured endpoints
  - Database: Neon PostgreSQL accessed only via SQLModel ORM
  - Authentication: Better Auth with JWT, centralized identity management
  - No layer bypasses another's internals

### ✅ V. Multi-User Data Isolation
- **Status**: PASS
- **Evidence**:
  - Users must register/sign-in (FR-001, FR-007)
  - Users only see their own data (FR-015)
  - All API endpoints extract user ID from JWT (FR-014)
  - All database queries include WHERE user_id = <authenticated_user_id> (FR-015)
  - Unauthorized access returns 401/403 (FR-016, FR-017)

### ✅ VI. Environment-Based Configuration
- **Status**: PASS
- **Evidence**:
  - JWT signing secret in .env (FR-011)
  - Database connection string in .env (inherited from Feature 001)
  - .env files excluded from version control via .gitignore
  - Separate secrets for dev/prod environments

### 🔍 Technology Stack Compliance
- **Status**: PASS
- **Evidence**:
  - Frontend: Next.js 16+ (App Router) ✓
  - Backend: FastAPI (latest) ✓
  - ORM: SQLModel ✓
  - Database: Neon Serverless PostgreSQL ✓
  - Authentication: Better Auth (JWT) ✓
  - Development: Claude Code + Spec-Kit Plus ✓

**Constitution Check Result**: ✅ ALL GATES PASSED - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-api-security/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technical decisions)
├── data-model.md        # Phase 1 output (User entity schema)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
│   ├── auth-api.yaml    # OpenAPI spec for /auth/signup and /auth/signin
│   └── jwt-payload.json # JWT token payload schema
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)

backend/
├── app/
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── models.py          # User SQLModel (email, password_hash)
│   │   ├── schemas.py         # Pydantic models (SignupRequest, SigninRequest, TokenResponse)
│   │   ├── service.py         # Auth business logic (password hashing, JWT creation)
│   │   └── router.py          # FastAPI routes (/auth/signup, /auth/signin)
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── jwt_auth.py        # JWT verification middleware
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py          # Settings (JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION)
│   │   └── security.py        # JWT utilities (verify_token, decode_token, get_current_user)
│   └── main.py                # FastAPI app with middleware registration
├── tests/
│   ├── test_auth_signup.py    # Test user registration
│   ├── test_auth_signin.py    # Test user sign-in
│   ├── test_jwt_middleware.py # Test JWT verification
│   └── test_user_isolation.py # Test cross-user access prevention
└── requirements.txt           # Add: python-jose[cryptography], passlib[bcrypt]

frontend/
├── app/
│   ├── auth/
│   │   ├── signup/
│   │   │   └── page.tsx       # Registration page
│   │   └── signin/
│   │       └── page.tsx       # Sign-in page
│   ├── lib/
│   │   ├── auth.ts            # Better Auth configuration (JWT mode)
│   │   └── api-client.ts      # HTTP client with JWT token attachment
│   └── components/
│       └── auth/
│           ├── SignupForm.tsx # Registration form component
│           └── SigninForm.tsx # Sign-in form component
├── tests/
│   ├── auth/
│   │   ├── signup.test.tsx    # Test registration flow
│   │   └── signin.test.tsx    # Test sign-in flow
│   └── lib/
│       └── api-client.test.ts # Test token attachment
└── package.json               # Add: better-auth (JWT dependencies)

.env (both frontend and backend)
JWT_SECRET=<shared-secret-key>  # MUST be identical in both .env files
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1
```

**Structure Decision**: Web application structure selected because feature spans both Next.js frontend (Better Auth integration, signup/signin pages) and FastAPI backend (JWT verification middleware, auth endpoints). Clear separation between frontend/ and backend/ directories maintains architectural boundaries per Constitution Principle IV.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitutional principles are satisfied by this design.

---

# Phase 0: Research & Technical Decisions

## Research Tasks

Based on Technical Context and user requirements, the following areas require research:

1. **Better Auth JWT Configuration**: How to configure Better Auth to issue JWT tokens instead of session cookies
2. **JWT Payload Structure**: Required fields for backend user identification and authorization
3. **FastAPI JWT Middleware**: Best practices for implementing JWT verification middleware
4. **Frontend Token Storage**: Secure client-side storage strategy (localStorage vs sessionStorage)
5. **Token Attachment Strategy**: How to automatically attach JWT tokens to all API requests
6. **Cross-Origin Configuration**: CORS setup for frontend-backend JWT communication
7. **Password Hashing**: bcrypt configuration and best practices for FastAPI
8. **User ID Extraction**: Strategy for extracting user ID from JWT and filtering database queries

## Research Findings

**Status**: ✅ COMPLETE

All research tasks have been completed and documented in `research.md`. Key decisions:

- **Better Auth**: Configured in JWT mode with localStorage storage
- **JWT Payload**: `{sub, email, iat, exp, type}` with HS256 algorithm
- **Backend Auth**: FastAPI Depends() pattern for selective endpoint protection
- **Token Storage**: localStorage (acceptable for MVP, XSS mitigated by Next.js)
- **Token Attachment**: Centralized API client wrapper with automatic header injection
- **CORS**: FastAPI middleware allowing frontend origin with credentials
- **Password Hashing**: passlib + bcrypt with cost factor 12
- **User Filtering**: SQLModel WHERE clauses with user_id from JWT

See: `specs/002-auth-api-security/research.md` for detailed rationale and alternatives.

---

# Phase 1: Design & Contracts

## Design Artifacts

**Status**: ✅ COMPLETE

### 1. Data Model (`data-model.md`)

**User Entity**:
- Fields: id (PK), email (unique), password_hash, created_at, updated_at
- Validation: RFC 5322 email format, password complexity (8+ chars, uppercase, lowercase, digit, special)
- Security: bcrypt hashing with cost factor 12, no plaintext storage
- Relationships: One-to-many with Todo (CASCADE delete)

**Pydantic Schemas**:
- SignupRequest: Email + password with validation
- SigninRequest: Email + password
- TokenResponse: access_token, token_type, expires_in
- UserResponse: id, email, created_at (excludes password_hash)

### 2. API Contracts (`contracts/`)

**auth-api.yaml** (OpenAPI 3.0):
- POST /auth/signup: Register new user (returns JWT)
- POST /auth/signin: Authenticate user (returns JWT)
- Request/response schemas with examples
- Error responses (400, 401) with consistent messages

**jwt-payload.json** (JSON Schema):
- Token payload structure: {sub, email, iat, exp, type}
- Field descriptions and validation rules
- Usage notes for frontend and backend
- Security requirements (signature verification, expiration check)

### 3. Quickstart Guide (`quickstart.md`)

**Setup Instructions**:
- Environment configuration (.env files for frontend and backend)
- Dependency installation (python-jose, passlib, better-auth)
- Database migration (users table creation)
- Implementation order (backend → middleware → frontend → tests)

**Testing Guide**:
- Manual testing with curl commands
- Automated testing with pytest and Jest
- Verification checklist (20 items)
- Troubleshooting common issues

## Agent Context Update

**Status**: ✅ COMPLETE

Updated agent-specific context file with new technologies:
- Better Auth (JWT mode)
- python-jose[cryptography]
- passlib[bcrypt]

---

# Phase 2: Task Breakdown

**Status**: ⏸️ PENDING

Task breakdown will be generated by running `/sp.tasks` command. This command is NOT part of `/sp.plan` and must be run separately.

Expected task categories:
1. Backend authentication endpoints (signup, signin)
2. Backend JWT middleware (verification, user extraction)
3. Frontend authentication pages (signup, signin)
4. Frontend API client (token attachment)
5. Database migration (users table)
6. Testing (unit, integration, end-to-end)

---

# Post-Design Constitution Check

*Re-evaluating constitutional compliance after design decisions*

### ✅ I. Spec-Driven Development (SDD)
- **Status**: PASS
- **Evidence**: All design artifacts (research.md, data-model.md, contracts/, quickstart.md) derived from spec.md. Implementation will follow documented plan.

### ✅ II. Security-First Design
- **Status**: PASS
- **Evidence**:
  - JWT authentication enforced on all endpoints except /auth/* (research.md)
  - User ID extraction from JWT for database filtering (data-model.md)
  - bcrypt password hashing with cost factor 12 (research.md)
  - Consistent error messages to prevent user enumeration (auth-api.yaml)
  - CORS configured with specific origins (research.md)

### ✅ III. Zero Manual Coding
- **Status**: PASS
- **Evidence**: Quickstart.md specifies implementation using specialized agents (auth-specialist, fastapi-backend-dev, nextjs-frontend-builder).

### ✅ IV. Clear Separation of Concerns
- **Status**: PASS
- **Evidence**:
  - Frontend: Better Auth + API client (auth.ts, api-client.ts)
  - Backend: FastAPI endpoints + JWT middleware (auth/router.py, core/security.py)
  - Database: SQLModel ORM (auth/models.py)
  - No layer bypasses another

### ✅ V. Multi-User Data Isolation
- **Status**: PASS
- **Evidence**:
  - User ID extracted from JWT (research.md: get_current_user_id)
  - All queries filtered by user_id (data-model.md: SQLModel WHERE clauses)
  - Ownership verification on DELETE/PUT (data-model.md: implementation pattern)
  - 401/403 error codes for unauthorized access (auth-api.yaml)

### ✅ VI. Environment-Based Configuration
- **Status**: PASS
- **Evidence**:
  - JWT_SECRET in .env files (quickstart.md)
  - DATABASE_URL in .env (inherited from Feature 001)
  - .env files excluded from version control (quickstart.md: troubleshooting)

**Post-Design Constitution Check Result**: ✅ ALL GATES PASSED - Ready for Task Generation

---

# Summary

## Deliverables

This planning phase has produced:

1. **Implementation Plan** (this file): Technical context, constitution check, project structure
2. **Research Findings** (`research.md`): 8 technical decisions with rationale and alternatives
3. **Data Model** (`data-model.md`): User entity schema, validation rules, SQLModel definitions
4. **API Contracts** (`contracts/`):
   - `auth-api.yaml`: OpenAPI spec for /auth/signup and /auth/signin
   - `jwt-payload.json`: JWT token payload schema
5. **Quickstart Guide** (`quickstart.md`): Setup, implementation order, testing, troubleshooting

## Key Architectural Decisions

1. **Authentication Flow**: Better Auth (frontend) → JWT token → FastAPI verification (backend)
2. **Token Management**: Stateless JWT with 1-hour expiration, stored in localStorage
3. **User Isolation**: User ID extracted from JWT, all queries filtered by authenticated user_id
4. **Password Security**: bcrypt with cost factor 12, no plaintext storage
5. **API Protection**: FastAPI Depends() pattern for selective endpoint authentication
6. **Error Handling**: Consistent 401/403 responses, no user enumeration

## Next Steps

1. **Run `/sp.tasks`** to generate actionable task breakdown from this plan
2. **Run `/sp.implement`** to execute tasks using specialized agents
3. **Test thoroughly** using verification checklist in quickstart.md
4. **Document deviations** in ADRs if implementation differs from plan
5. **Create PR** with `/sp.git.commit_pr` when feature is complete

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT secret exposure | Critical - all tokens can be forged | .gitignore .env files, use secret scanning, rotate secrets |
| Better Auth complexity | Medium - may require fallback | Review docs thoroughly, allocate troubleshooting time, have fallback plan |
| Token expiration UX | Low - users logged out abruptly | Accept for MVP, document as known issue, plan refresh for future |

---

**Plan Status**: ✅ COMPLETE - Ready for `/sp.tasks`
**Branch**: 002-auth-api-security
**Date**: 2026-01-19

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
