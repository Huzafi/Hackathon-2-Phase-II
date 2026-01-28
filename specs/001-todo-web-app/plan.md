# Implementation Plan: Todo Full-Stack Web Application (Backend)

**Branch**: `001-todo-web-app` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-web-app/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Transform the console-based todo application into a secure, multi-user web application backend using FastAPI, SQLModel ORM, and Neon Serverless PostgreSQL. The backend will provide RESTful API endpoints for user authentication (via Better Auth JWT) and CRUD operations on todos, with strict user data isolation enforced at the database query level.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI (latest), SQLModel (latest), Better Auth SDK (JWT), Pydantic v2, httpx
**Storage**: Neon Serverless PostgreSQL (cloud-hosted, serverless)
**Testing**: pytest, pytest-asyncio, httpx (for API testing)
**Target Platform**: Linux/Windows server (containerizable, serverless-ready)
**Project Type**: Web backend (REST API)
**Performance Goals**: <200ms p95 latency for CRUD operations, support 10+ concurrent users
**Constraints**: Stateless API (no server-side sessions), JWT-only authentication, all queries must filter by user_id
**Scale/Scope**: 10-50 concurrent users (hackathon scope), 2 database tables (User, Todo), 8-10 API endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development (SDD)
✅ **PASS** - Feature specification exists at `specs/001-todo-web-app/spec.md` with documented requirements, user stories, and acceptance criteria. This plan follows the SDD workflow (spec → plan → tasks → implement).

### Principle II: Security-First Design
✅ **PASS** - Plan enforces:
- JWT authentication on all endpoints except signup/signin
- User ID filtering on all database queries
- Environment variables for secrets (database URL, JWT secret)
- HTTP status codes (401/403) for unauthorized access
- Password hashing before storage

### Principle III: Zero Manual Coding
✅ **PASS** - All implementation will use specialized Claude Code agents:
- `fastapi-backend-dev` for API endpoints
- `neon-db-specialist` for database schema and queries
- `auth-specialist` for Better Auth integration

### Principle IV: Clear Separation of Concerns
✅ **PASS** - Backend is stateless REST API layer:
- No direct frontend coupling
- Database access only via SQLModel ORM
- Authentication handled by Better Auth with JWT
- Clear API contract boundaries

### Principle V: Multi-User Data Isolation
✅ **PASS** - All API endpoints will:
- Extract user ID from JWT token
- Include `WHERE user_id = <authenticated_user_id>` in all queries
- Return 401/403 for unauthorized access attempts
- Prevent cross-user data access

### Principle VI: Environment-Based Configuration
✅ **PASS** - All secrets externalized:
- `DATABASE_URL` in `.env`
- `JWT_SECRET` in `.env`
- `.env` excluded from version control via `.gitignore`

**GATE STATUS**: ✅ ALL CHECKS PASSED - Proceed to Phase 0 research

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-web-app/
├── spec.md              # Feature specification (already exists)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth.openapi.yaml
│   └── todos.openapi.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # SQLModel database models (User, Todo)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── todo.py
│   ├── schemas/         # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── todo.py
│   ├── api/             # FastAPI route handlers
│   │   ├── __init__.py
│   │   ├── auth.py      # Signup/signin endpoints
│   │   └── todos.py     # CRUD endpoints for todos
│   ├── core/            # Core utilities and configuration
│   │   ├── __init__.py
│   │   ├── config.py    # Environment variable loading
│   │   ├── database.py  # Database connection and session management
│   │   └── security.py  # JWT verification and password hashing
│   ├── dependencies/    # FastAPI dependency injection
│   │   ├── __init__.py
│   │   └── auth.py      # get_current_user dependency
│   └── main.py          # FastAPI application entry point
├── tests/
│   ├── conftest.py      # Pytest fixtures (test database, test client)
│   ├── test_auth.py     # Authentication endpoint tests
│   └── test_todos.py    # Todo CRUD endpoint tests
├── .env.example         # Example environment variables
├── requirements.txt     # Python dependencies
└── README.md            # Backend setup instructions

frontend/
├── [Next.js App Router structure - handled by nextjs-frontend-builder agent]
└── [Not part of this backend planning phase]
```

**Structure Decision**: Web application structure (Option 2) selected. This plan focuses on the **backend** component only. The backend is a standalone FastAPI application with clear separation between models (database), schemas (API contracts), API routes (endpoints), and core utilities (config, security, database). The frontend will be planned separately using the `nextjs-frontend-builder` agent.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** All constitutional principles are satisfied by this plan. No complexity justification required.
