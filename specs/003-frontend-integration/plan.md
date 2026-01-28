# Implementation Plan: Frontend Application and Integration

**Branch**: `003-frontend-integration` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a responsive Next.js frontend application that integrates with the secured FastAPI backend. Implement authentication flows (signup/signin) using Better Auth with JWT tokens, and provide full CRUD task management functionality. The frontend must enforce user isolation by including JWT tokens in all API requests, handle loading/error/empty states gracefully, and provide a modern, responsive UI that works across mobile, tablet, and desktop devices.

## Technical Context

**Language/Version**: TypeScript 5.7+ with Next.js 15.1+ (App Router)
**Primary Dependencies**:
- Next.js 15.1+ (React 19.0+) - Frontend framework with App Router
- Better Auth 1.0.7+ - Authentication with JWT token management
- React 19.0+ - UI library
- TypeScript 5.7+ - Type safety

**Storage**: Browser localStorage/sessionStorage for JWT token persistence
**Testing**: NEEDS CLARIFICATION (Jest + React Testing Library recommended for Next.js)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) with ES6+ support
**Project Type**: Web application (frontend only, integrates with existing FastAPI backend)
**Performance Goals**:
- Page load < 2 seconds on standard connection
- API operations complete < 2 seconds with visual feedback
- Responsive UI at 60fps during interactions

**Constraints**:
- Must integrate with existing FastAPI backend from Spec 2
- JWT tokens must be included in all protected API requests
- Responsive design: 320px (mobile) to 1920px (desktop)
- No offline support (out of scope)
- No real-time updates (out of scope)

**Scale/Scope**:
- 6 core user stories (auth, view, create, update, complete, delete tasks)
- ~5-8 pages/routes (signin, signup, task list, task detail/edit)
- ~10-15 React components
- Multi-user support with user isolation enforced by backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Spec-Driven Development (SDD)
**Status**: ✅ PASS
- Feature specification exists at `specs/003-frontend-integration/spec.md`
- This implementation plan documents architectural decisions
- Tasks will be generated via `/sp.tasks` before implementation
- All code will be generated through specialized agents

### II. Security-First Design
**Status**: ✅ PASS
- JWT authentication enforced on all protected routes
- JWT tokens included in Authorization header for all API requests
- User isolation enforced by backend (JWT validation + user_id filtering)
- No secrets hardcoded (JWT secret in .env, shared with backend)
- Unauthenticated users redirected to signin page
- HTTP status codes handled explicitly (401, 403, 404, 500)

### III. Zero Manual Coding
**Status**: ✅ PASS
- Frontend implementation delegated to `nextjs-frontend-builder` agent
- Authentication flows delegated to `auth-specialist` agent (if needed)
- All code generation documented and traceable
- No manual edits outside Claude Code

### IV. Clear Separation of Concerns
**Status**: ✅ PASS
- Frontend layer only (Next.js App Router)
- Consumes REST APIs from existing FastAPI backend
- No direct database access
- No backend logic in frontend
- Authentication handled by Better Auth + JWT tokens

### V. Multi-User Data Isolation
**Status**: ✅ PASS
- Users must sign up/sign in to access application
- JWT token identifies authenticated user
- Backend enforces user_id filtering on all queries
- Frontend includes JWT in all protected API requests
- Unauthorized access returns 401/403 from backend

### VI. Environment-Based Configuration
**Status**: ✅ PASS
- Backend API URL in `.env.local`
- Better Auth configuration in `.env.local`
- No secrets committed to version control
- Environment variables documented in README

**Overall Gate Status**: ✅ PASS - All constitutional principles satisfied. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-integration/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/                 # Next.js 15+ App Router application
├── app/                 # Next.js App Router pages and layouts
│   ├── (auth)/         # Auth route group (signin, signup)
│   │   ├── signin/
│   │   └── signup/
│   ├── (protected)/    # Protected route group (requires auth)
│   │   ├── tasks/      # Task list and management
│   │   └── layout.tsx  # Protected layout with auth check
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing/redirect page
├── components/          # Reusable React components
│   ├── auth/           # Auth-related components
│   ├── tasks/          # Task-related components
│   ├── ui/             # Generic UI components
│   └── layout/         # Layout components (header, nav, etc.)
├── lib/                # Utility functions and configurations
│   ├── api/            # API client with JWT injection
│   ├── auth/           # Better Auth configuration
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Helper functions
├── types/              # TypeScript type definitions
├── public/             # Static assets
├── .env.local          # Environment variables (not committed)
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration

backend/                 # Existing FastAPI backend (from Spec 2)
├── src/
│   ├── models/         # SQLModel database models
│   ├── api/            # FastAPI endpoints
│   ├── auth/           # JWT authentication
│   └── main.py         # FastAPI app entry point
└── tests/
```

**Structure Decision**: Web application structure with separate frontend and backend directories. Frontend uses Next.js 15+ App Router with route groups for authentication and protected pages. The `(auth)` route group contains public authentication pages (signin, signup), while the `(protected)` route group contains pages that require JWT authentication. API client layer in `lib/api/` handles automatic JWT header injection for all backend requests.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations detected. All constitutional principles satisfied.

---

## Phase 0: Research Summary

**Status**: ✅ Complete

All unknowns from Technical Context have been resolved. Key research findings documented in `research.md`:

1. **Testing Framework**: Jest + React Testing Library + Playwright
2. **Authentication Pattern**: Middleware-based with route groups
3. **API Client**: Centralized client with automatic JWT injection
4. **State Handling**: React Suspense + Error Boundaries + Conditional rendering
5. **Responsive Design**: Tailwind CSS with mobile-first approach

---

## Phase 1: Design Summary

**Status**: ✅ Complete

### Data Model (`data-model.md`)

Defined TypeScript types for:
- Core entities: User, Task
- Request/response types: SignupRequest, SigninRequest, AuthResponse, CreateTaskRequest, UpdateTaskRequest
- UI state types: LoadingState, FormState, ApiError
- Validation functions for email, password, task title, task description

### API Contracts (`contracts/`)

Documented all backend API endpoints:
- **Authentication** (`auth-api.md`): POST /api/auth/signup, POST /api/auth/signin, GET /api/auth/me
- **Task Management** (`tasks-api.md`): GET /api/tasks, POST /api/tasks, GET /api/tasks/{id}, PUT /api/tasks/{id}, DELETE /api/tasks/{id}

Each contract includes:
- Request/response formats
- HTTP status codes
- Error handling
- Frontend implementation examples
- Security considerations

### Quickstart Guide (`quickstart.md`)

Comprehensive setup and development guide covering:
- Prerequisites and initial setup
- Environment configuration
- Running development and production builds
- Project structure overview
- Common development tasks
- Troubleshooting guide

### Agent Context Update

Updated `CLAUDE.md` with new technologies:
- TypeScript 5.7+ with Next.js 15.1+ (App Router)
- Browser localStorage/sessionStorage for JWT token persistence

---

## Constitution Check (Post-Design)

**Status**: ✅ PASS - All principles still satisfied after design phase

### I. Spec-Driven Development (SDD)
✅ Design artifacts created (research.md, data-model.md, contracts/, quickstart.md)
✅ Ready for task generation via `/sp.tasks`

### II. Security-First Design
✅ JWT authentication enforced at middleware level
✅ API client automatically injects JWT tokens
✅ User isolation enforced by backend (verified in contracts)
✅ Environment variables for configuration (documented in quickstart)

### III. Zero Manual Coding
✅ Implementation will use `nextjs-frontend-builder` agent
✅ All design decisions documented for agent execution

### IV. Clear Separation of Concerns
✅ Frontend architecture maintains clear boundaries
✅ API client layer abstracts backend communication
✅ Route groups separate public and protected pages

### V. Multi-User Data Isolation
✅ JWT token identifies user in all requests
✅ Backend enforces user_id filtering (documented in contracts)
✅ Frontend cannot bypass user isolation

### VI. Environment-Based Configuration
✅ Environment variables documented in quickstart.md
✅ .env.local template provided
✅ No secrets in code

---

## Key Architectural Decisions

### 1. Next.js App Router with Route Groups

**Decision**: Use App Router with `(auth)` and `(protected)` route groups

**Rationale**:
- Server-side authentication checks prevent FOUC
- Clear separation of public and protected routes
- Aligns with Next.js 15+ best practices
- Enables middleware-based auth without repetitive checks

**Alternatives Rejected**:
- Pages Router: Legacy, not recommended for new projects
- Client-side only auth: Security risk, poor UX (FOUC)

**ADR Candidate**: Yes - significant architectural decision affecting routing and security

---

### 2. Centralized API Client with JWT Injection

**Decision**: Create `lib/api/client.ts` with automatic JWT header injection

**Rationale**:
- Single source of truth for API configuration
- Eliminates repetitive JWT injection code
- Centralized error handling (401 → redirect to signin)
- Type-safe API calls with TypeScript

**Alternatives Rejected**:
- Manual fetch in components: Repetitive, error-prone
- SWR/React Query without wrapper: Still requires manual JWT injection

**ADR Candidate**: Yes - significant decision affecting all API interactions

---

### 3. Middleware-Based Authentication

**Decision**: Use Next.js middleware to check JWT before rendering protected pages

**Rationale**:
- Server-side auth checks prevent unauthorized access
- Redirects happen before page render (no FOUC)
- Single auth check for all protected routes
- Better security than client-side checks

**Alternatives Rejected**:
- Client-side auth checks: Can be bypassed, causes FOUC
- Per-page auth checks: Repetitive, easy to forget

**ADR Candidate**: Yes - critical security decision

---

### 4. Tailwind CSS for Responsive Design

**Decision**: Use Tailwind CSS with mobile-first responsive utilities

**Rationale**:
- Utility-first approach speeds development
- Built-in responsive breakpoints (sm, md, lg, xl)
- No custom CSS needed for most use cases
- Excellent Next.js integration

**Alternatives Rejected**:
- CSS Modules: More verbose, requires custom media queries
- Styled Components: Runtime overhead, not ideal for App Router

**ADR Candidate**: No - standard technology choice, not architecturally significant

---

### 5. React Suspense + Error Boundaries for State Handling

**Decision**: Use Next.js built-in `loading.tsx` and `error.tsx` files with React Suspense

**Rationale**:
- Declarative loading and error states
- Consistent UX across all pages
- Built-in Next.js support
- Reduces boilerplate in components

**Alternatives Rejected**:
- Manual loading flags: Repetitive, inconsistent
- Global loading spinner: Poor UX, doesn't show what's loading

**ADR Candidate**: No - standard React pattern, not architecturally significant

---

## Architectural Decision Records (ADRs)

Based on the three-part test (Impact + Alternatives + Scope), the following decisions should be documented as ADRs:

1. **ADR-001: Next.js App Router with Route Groups for Authentication**
   - Impact: Long-term routing and security architecture
   - Alternatives: Pages Router, client-side auth, per-page checks
   - Scope: Cross-cutting, affects all pages and security

2. **ADR-002: Centralized API Client with Automatic JWT Injection**
   - Impact: All backend communication patterns
   - Alternatives: Manual fetch, SWR/React Query without wrapper
   - Scope: Cross-cutting, affects all API interactions

3. **ADR-003: Middleware-Based Authentication for Protected Routes**
   - Impact: Security model and user experience
   - Alternatives: Client-side checks, per-page checks
   - Scope: Cross-cutting, affects security and routing

**Suggestion**: After `/sp.tasks` is complete, run `/sp.adr` to document these decisions.

---

## Dependencies Summary

### Production Dependencies (to be installed)
- `next@^15.1.3` - Already installed
- `react@^19.0.0` - Already installed
- `react-dom@^19.0.0` - Already installed
- `better-auth@^1.0.7` - Already installed
- `tailwindcss@^3.4.0` - **To be added**
- `clsx@^2.0.0` - **To be added** (conditional class names)

### Development Dependencies (to be installed)
- `typescript@^5.7.3` - Already installed
- `@types/node@^22.10.5` - Already installed
- `@types/react@^19.0.6` - Already installed
- `@types/react-dom@^19.0.2` - Already installed
- `eslint@^9.18.0` - Already installed
- `eslint-config-next@^15.1.3` - Already installed
- `jest@^29.7.0` - **To be added**
- `@testing-library/react@^14.0.0` - **To be added**
- `@testing-library/jest-dom@^6.1.0` - **To be added**
- `@playwright/test@^1.40.0` - **To be added**
- `@types/jest@^29.5.0` - **To be added**

---

## Next Steps

Phase 1 (Design) is complete. Proceed to Phase 2:

1. **Generate Tasks** (`/sp.tasks`): Break down implementation into actionable tasks
2. **Document ADRs** (`/sp.adr`): Create ADRs for the 3 significant architectural decisions
3. **Implement** (`/sp.implement`): Execute tasks using specialized agents:
   - `nextjs-frontend-builder` for frontend components and pages
   - `auth-specialist` for authentication flows (if needed)
4. **Test**: Verify full-stack integration with backend
5. **Review**: Validate against spec acceptance criteria

---

## Planning Artifacts

All planning artifacts have been generated:

- ✅ `plan.md` - This file (implementation plan)
- ✅ `research.md` - Research findings and decisions
- ✅ `data-model.md` - TypeScript types and data structures
- ✅ `contracts/auth-api.md` - Authentication API contracts
- ✅ `contracts/tasks-api.md` - Task management API contracts
- ✅ `quickstart.md` - Setup and development guide

**Branch**: `003-frontend-integration`
**Spec**: `specs/003-frontend-integration/spec.md`
**Status**: Ready for task generation (`/sp.tasks`)
