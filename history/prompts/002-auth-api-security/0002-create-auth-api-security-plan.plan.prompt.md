---
id: 0002
title: Create Auth API Security Plan
stage: plan
date: 2026-01-19
surface: agent
model: claude-haiku-4-5-20251001
feature: 002-auth-api-security
branch: 002-auth-api-security
user: user
command: /sp.plan
labels: ["authentication", "security", "jwt", "architecture", "planning", "better-auth", "fastapi"]
links:
  spec: specs/002-auth-api-security/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-auth-api-security/plan.md
  - specs/002-auth-api-security/research.md
  - specs/002-auth-api-security/data-model.md
  - specs/002-auth-api-security/quickstart.md
  - specs/002-auth-api-security/contracts/auth-api.yaml
  - specs/002-auth-api-security/contracts/jwt-payload.json
  - CLAUDE.md (agent context updated)
tests:
  - No tests run (planning phase)
---

## Prompt

/sp.plan

Create:
- Auth flow architecture (Next.js Better Auth → JWT → FastAPI)
- JWT verification middleware for FastAPI
- Frontend API client strategy for token attachment

Decisions needing documentation:
- JWT payload fields required by backend
- Token expiration duration and validation rules
- Strategy for matching JWT user identity with route user_id

Testing & validation:
- Verify unauthorized requests return 401
- Confirm JWT signature validation using shared secret
- Ensure authenticated users only access their own tasks

## Response snapshot

Created comprehensive architectural plan for JWT-based authentication system:

**Phase 0: Research & Technical Decisions** (8 areas researched)
- Better Auth JWT configuration (JWT mode with localStorage)
- JWT payload structure ({sub, email, iat, exp, type})
- FastAPI JWT middleware (Depends() pattern)
- Frontend token storage (localStorage with XSS mitigation)
- Token attachment strategy (centralized API client)
- CORS configuration (FastAPI middleware)
- Password hashing (passlib + bcrypt cost 12)
- User ID extraction (SQLModel WHERE clauses)

**Phase 1: Design & Contracts**
- Data model: User entity with email, password_hash, timestamps
- API contracts: OpenAPI spec for /auth/signup and /auth/signin
- JWT payload schema: JSON Schema with field descriptions
- Quickstart guide: Setup, implementation order, testing, troubleshooting

**Key Architectural Decisions**:
1. Authentication flow: Better Auth (frontend) → JWT token → FastAPI verification (backend)
2. Token management: Stateless JWT with 1-hour expiration, localStorage storage
3. User isolation: User ID extracted from JWT, all queries filtered by authenticated user_id
4. Password security: bcrypt with cost factor 12, no plaintext storage
5. API protection: FastAPI Depends() pattern for selective endpoint authentication
6. Error handling: Consistent 401/403 responses, no user enumeration

**Constitution Check**: All 6 principles passed (SDD, Security-First, Zero Manual Coding, Separation of Concerns, Multi-User Isolation, Environment-Based Config)

**Project Structure**:
- Backend: app/auth/ (models, schemas, service, router), middleware/jwt_auth.py, core/security.py
- Frontend: app/auth/signup/, app/auth/signin/, lib/auth.ts, lib/api-client.ts
- Database: users table with email (unique), password_hash, timestamps

## Outcome

- ✅ Impact: Created complete architectural plan ready for task generation. Establishes secure authentication foundation with JWT-based stateless auth, user isolation enforcement, and clear separation between frontend and backend concerns.
- 🧪 Tests: No tests run (planning phase). Plan includes testing strategy with 20-item verification checklist and manual/automated testing guides.
- 📁 Files: Created 6 files - plan.md (405 lines), research.md (8 decisions), data-model.md (User entity), quickstart.md (setup guide), auth-api.yaml (OpenAPI), jwt-payload.json (schema)
- 🔁 Next prompts: `/sp.tasks` (generate actionable task breakdown) → `/sp.implement` (execute with specialized agents)
- 🧠 Reflection: Planning phase successfully balanced security rigor with implementation clarity. All research questions resolved with documented rationale and alternatives. Constitution check passed both pre-design and post-design. Ready for task generation and implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None. Planning workflow executed successfully with all phases completed.
- Graders run and results (PASS/FAIL): Constitution Check (pre-design) - PASS (6/6), Constitution Check (post-design) - PASS (6/6)
- Prompt variant (if applicable): Standard /sp.plan workflow with user-specified focus areas (auth flow, JWT middleware, API client)
- Next experiment (smallest change to try): N/A - workflow executed correctly
