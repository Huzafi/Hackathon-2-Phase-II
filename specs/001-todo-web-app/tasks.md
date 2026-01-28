# Tasks: Todo Full-Stack Web Application (Backend)

**Input**: Design documents from `/specs/001-todo-web-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification. If TDD is desired, add test tasks before implementation tasks in each user story phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with backend focus. All paths use `backend/` prefix as defined in plan.md.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend project structure with src/, tests/, and configuration files per plan.md
- [X] T002 Create requirements.txt with dependencies: fastapi, sqlmodel, uvicorn[standard], python-jose[cryptography], passlib[bcrypt], python-multipart, pydantic-settings, psycopg2-binary, pytest, httpx
- [X] T003 [P] Create .env.example with DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS placeholders
- [X] T004 [P] Create .gitignore to exclude .env, __pycache__, venv/, *.pyc, .pytest_cache/
- [X] T005 [P] Create backend/src/__init__.py and all module __init__.py files (models/, schemas/, api/, core/, dependencies/)
- [X] T006 [P] Create backend/README.md with setup instructions referencing quickstart.md

**Checkpoint**: Project structure ready for foundational implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Implement environment configuration in backend/src/core/config.py using pydantic-settings (Settings class with database_url, jwt_secret, jwt_algorithm, jwt_expiration_hours)
- [X] T008 [P] Implement database connection and session management in backend/src/core/database.py (create_engine with NullPool, create_db_and_tables function, get_session dependency)
- [X] T009 [P] Implement password hashing utilities in backend/src/core/security.py (hash_password, verify_password using passlib bcrypt)
- [X] T010 [P] Implement JWT token creation and verification in backend/src/core/security.py (create_access_token, verify_jwt_token using python-jose)
- [X] T011 Create FastAPI application instance in backend/src/main.py with CORS middleware, startup event to create tables, and root endpoint
- [X] T012 Implement get_current_user dependency in backend/src/dependencies/auth.py (HTTPBearer security, verify JWT, extract user from database, return User or raise 401)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts and sign in with email/password. JWT tokens issued on successful authentication. Sessions maintained across browser refreshes.

**Independent Test**: Register a new account with email/password → Verify account created → Sign out → Sign in with same credentials → Verify JWT token received → Access protected endpoint with token → Verify authentication works

### Implementation for User Story 1

- [X] T013 [P] [US1] Create User model in backend/src/models/user.py (SQLModel with id, email, hashed_password, created_at, todos relationship)
- [X] T014 [P] [US1] Create auth request schemas in backend/src/schemas/auth.py (SignupRequest, SigninRequest with email and password fields)
- [X] T015 [P] [US1] Create auth response schemas in backend/src/schemas/auth.py (UserResponse excluding hashed_password, AuthResponse with user, access_token, token_type)
- [X] T016 [US1] Implement POST /api/auth/signup endpoint in backend/src/api/auth.py (validate email uniqueness, hash password, create user, generate JWT, return AuthResponse)
- [X] T017 [US1] Implement POST /api/auth/signin endpoint in backend/src/api/auth.py (lookup user by email, verify password, generate JWT, return AuthResponse or 401)
- [X] T018 [US1] Implement GET /api/auth/me endpoint in backend/src/api/auth.py (use get_current_user dependency, return UserResponse)
- [X] T019 [US1] Register auth router in backend/src/main.py with prefix /api/auth and tags
- [X] T020 [US1] Add email format validation and password strength validation (min 8 characters) to auth schemas
- [X] T021 [US1] Add error handling for duplicate email (400), invalid credentials (401), and missing token (401)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can signup, signin, and access protected endpoints with JWT tokens

---

## Phase 4: User Story 2 - Create and View Todos (Priority: P2)

**Goal**: Authenticated users can create new todos with title and optional description. Users can view a list of all their todos in reverse chronological order. Each user sees only their own todos.

**Independent Test**: Sign in as user → Create multiple todos with different titles and descriptions → View todo list → Verify all created todos appear → Verify todos sorted newest first → Sign in as different user → Verify they see only their own todos

### Implementation for User Story 2

- [X] T022 [P] [US2] Create Todo model in backend/src/models/todo.py (SQLModel with id, title, description, is_completed, user_id, created_at, updated_at, user relationship, composite index on user_id and created_at)
- [X] T023 [P] [US2] Create todo request schemas in backend/src/schemas/todo.py (TodoCreate with title and optional description, field validation for length limits)
- [X] T024 [P] [US2] Create todo response schema in backend/src/schemas/todo.py (TodoResponse with all fields including id, user_id, timestamps)
- [X] T025 [US2] Implement POST /api/todos endpoint in backend/src/api/todos.py (use get_current_user dependency, set user_id from current_user, validate title not empty, create todo, return TodoResponse with 201 status)
- [X] T026 [US2] Implement GET /api/todos endpoint in backend/src/api/todos.py (use get_current_user dependency, query todos filtered by current_user.id, order by created_at DESC, return list of TodoResponse)
- [X] T027 [US2] Register todos router in backend/src/main.py with prefix /api/todos and tags
- [X] T028 [US2] Add validation for title length (1-200 characters) and description length (0-1000 characters) in TodoCreate schema
- [X] T029 [US2] Add error handling for empty title (400) and validation errors (422)
- [X] T030 [US2] Verify user isolation: ensure GET /api/todos only returns todos where user_id matches authenticated user

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can signup, signin, create todos, and view their own todos

---

## Phase 5: User Story 3 - Mark Todos Complete/Incomplete (Priority: P3)

**Goal**: Authenticated users can toggle the completion status of their todos. Completed todos are visually distinguished (handled by frontend, backend provides is_completed field). Status persists across page refreshes.

**Independent Test**: Sign in → Create a todo → Mark it as complete via PATCH → Verify is_completed=true → Mark it as incomplete → Verify is_completed=false → Refresh → Verify status persists

### Implementation for User Story 3

- [X] T031 [P] [US3] Create TodoPatch schema in backend/src/schemas/todo.py (optional title, description, is_completed fields for partial updates)
- [X] T032 [US3] Implement GET /api/todos/{todo_id} endpoint in backend/src/api/todos.py (use get_current_user dependency, fetch todo by id, verify ownership with 403 if user_id mismatch, return TodoResponse or 404)
- [X] T033 [US3] Implement PATCH /api/todos/{todo_id} endpoint in backend/src/api/todos.py (use get_current_user dependency, fetch todo, verify ownership, update only provided fields, update updated_at timestamp, return TodoResponse)
- [X] T034 [US3] Add ownership verification helper function in backend/src/api/todos.py to check todo.user_id == current_user.id and raise 403 if mismatch
- [X] T035 [US3] Add error handling for todo not found (404), forbidden access (403), and validation errors (422)

**Checkpoint**: All three user stories (signup/signin, create/view todos, toggle completion) should now be independently functional

---

## Phase 6: User Story 4 - Edit Todos (Priority: P4)

**Goal**: Authenticated users can edit the title and description of their existing todos. Changes are saved and persist across page refreshes. Users can cancel edits without saving.

**Independent Test**: Sign in → Create a todo → Edit its title and description via PUT → Verify changes saved → Refresh → Verify changes persist → Attempt to edit another user's todo → Verify 403 error

### Implementation for User Story 4

- [X] T036 [P] [US4] Create TodoUpdate schema in backend/src/schemas/todo.py (required title, optional description, optional is_completed for full updates)
- [X] T037 [US4] Implement PUT /api/todos/{todo_id} endpoint in backend/src/api/todos.py (use get_current_user dependency, fetch todo, verify ownership, replace all fields with request data, update updated_at timestamp, return TodoResponse)
- [X] T038 [US4] Add validation to ensure title is not empty and respects length limits in TodoUpdate schema
- [X] T039 [US4] Add error handling for todo not found (404), forbidden access (403), empty title (400), and validation errors (422)

**Checkpoint**: Users can now fully manage their todos - create, view, toggle completion, and edit title/description

---

## Phase 7: User Story 5 - Delete Todos (Priority: P5)

**Goal**: Authenticated users can permanently delete their todos. Deleted todos are removed from the list and cannot be recovered. Users cannot delete other users' todos.

**Independent Test**: Sign in → Create multiple todos → Delete one todo → Verify it no longer appears in list → Refresh → Verify deletion persists → Attempt to delete another user's todo → Verify 403 error

### Implementation for User Story 5

- [X] T040 [US5] Implement DELETE /api/todos/{todo_id} endpoint in backend/src/api/todos.py (use get_current_user dependency, fetch todo, verify ownership, delete from database, return 204 No Content)
- [X] T041 [US5] Add error handling for todo not found (404) and forbidden access (403)
- [X] T042 [US5] Verify hard delete behavior: ensure todo is permanently removed from database and cannot be recovered

**Checkpoint**: All five user stories are now complete - full CRUD operations on todos with authentication and user isolation

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [X] T043 [P] Add comprehensive error handling middleware in backend/src/main.py to catch unhandled exceptions and return 500 with user-friendly messages
- [X] T044 [P] Add request logging middleware in backend/src/main.py to log all API requests with method, path, status code, and duration
- [X] T045 [P] Update backend/README.md with complete setup instructions, API endpoint documentation, and troubleshooting guide
- [X] T046 [P] Create backend/tests/conftest.py with pytest fixtures for test database (in-memory SQLite), test client, and test user authentication
- [X] T047 Validate quickstart.md instructions by following them step-by-step and updating any outdated steps
- [X] T048 [P] Add OpenAPI documentation customization in backend/src/main.py (title, description, version, contact info)
- [X] T049 [P] Add CORS configuration in backend/src/main.py to allow frontend origin (configurable via environment variable)
- [X] T050 Security audit: verify all endpoints use get_current_user dependency except signup/signin, all queries filter by user_id, no secrets in code
- [X] T051 Performance check: verify database indexes are created (users.email, todos.user_id, composite index on todos)
- [X] T052 [P] Add input sanitization to prevent XSS attacks in todo title and description fields

**Checkpoint**: Backend is production-ready with proper error handling, logging, documentation, and security hardening

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires User model from US1 but can be implemented independently
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires Todo model from US2 but extends existing endpoints
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Requires Todo model from US2 but adds new endpoint
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Requires Todo model from US2 but adds new endpoint

**Note**: While US2-US5 technically depend on models from earlier stories, they can be implemented in parallel if the team coordinates on model definitions first.

### Within Each User Story

- Models before endpoints (models define database schema)
- Schemas before endpoints (schemas define API contracts)
- Core endpoint logic before error handling
- Ownership verification before any data modification
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T003, T004, T005, T006 can run in parallel
- **Phase 2 (Foundational)**: T008, T009, T010 can run in parallel after T007
- **Phase 3 (US1)**: T013, T014, T015 can run in parallel
- **Phase 4 (US2)**: T022, T023, T024 can run in parallel
- **Phase 5 (US3)**: T031 can be done independently
- **Phase 6 (US4)**: T036 can be done independently
- **Phase 8 (Polish)**: T043, T044, T045, T046, T048, T049, T052 can run in parallel

**Once Foundational phase completes, all user stories can start in parallel if team capacity allows**

---

## Parallel Example: User Story 1

```bash
# Launch all schemas for User Story 1 together:
Task: "Create User model in backend/src/models/user.py"
Task: "Create auth request schemas in backend/src/schemas/auth.py"
Task: "Create auth response schemas in backend/src/schemas/auth.py"

# Then implement endpoints sequentially (they depend on models/schemas):
Task: "Implement POST /api/auth/signup endpoint"
Task: "Implement POST /api/auth/signin endpoint"
Task: "Implement GET /api/auth/me endpoint"
```

---

## Parallel Example: User Story 2

```bash
# Launch all schemas for User Story 2 together:
Task: "Create Todo model in backend/src/models/todo.py"
Task: "Create todo request schemas in backend/src/schemas/todo.py"
Task: "Create todo response schema in backend/src/schemas/todo.py"

# Then implement endpoints sequentially:
Task: "Implement POST /api/todos endpoint"
Task: "Implement GET /api/todos endpoint"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T012) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T013-T021) - Authentication
4. Complete Phase 4: User Story 2 (T022-T030) - Create and view todos
5. **STOP and VALIDATE**: Test signup → signin → create todos → view todos
6. Deploy/demo MVP with core functionality

**MVP Scope**: Users can register, sign in, create todos, and view their own todos. This represents the minimum viable product for a todo application.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Authentication works!)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP - can create and view todos!)
4. Add User Story 3 → Test independently → Deploy/Demo (Can mark todos complete!)
5. Add User Story 4 → Test independently → Deploy/Demo (Can edit todos!)
6. Add User Story 5 → Test independently → Deploy/Demo (Full CRUD complete!)
7. Add Polish → Final production-ready release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T012)
2. Once Foundational is done:
   - Developer A: User Story 1 (T013-T021) - Authentication
   - Developer B: User Story 2 (T022-T030) - Create/view todos (coordinate on User model with Dev A)
   - Developer C: User Story 3 (T031-T035) - Toggle completion (coordinate on Todo model with Dev B)
3. Stories complete and integrate independently
4. Remaining stories (US4, US5) can be assigned as developers finish

---

## Task Count Summary

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 6 tasks (BLOCKING)
- **Phase 3 (US1 - Authentication)**: 9 tasks
- **Phase 4 (US2 - Create/View)**: 9 tasks
- **Phase 5 (US3 - Toggle Complete)**: 5 tasks
- **Phase 6 (US4 - Edit)**: 4 tasks
- **Phase 7 (US5 - Delete)**: 3 tasks
- **Phase 8 (Polish)**: 10 tasks

**Total**: 52 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phases

**MVP Scope**: 30 tasks (Setup + Foundational + US1 + US2)

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story should be independently completable and testable**
- **Commit after each task or logical group** for incremental progress
- **Stop at any checkpoint to validate story independently**
- **User isolation is CRITICAL**: Every query must filter by authenticated user ID
- **Security first**: All endpoints except signup/signin require JWT authentication
- **No tests included**: Tests were not explicitly requested in spec.md. Add test tasks if TDD approach is desired.

---

## Validation Checklist

Before marking the feature complete, verify:

- [ ] All 5 user stories are independently testable
- [ ] User Story 1: Can signup, signin, and access protected endpoints
- [ ] User Story 2: Can create and view todos (only own todos visible)
- [ ] User Story 3: Can toggle todo completion status
- [ ] User Story 4: Can edit todo title and description
- [ ] User Story 5: Can delete todos
- [ ] User isolation: User A cannot access User B's todos (403 error)
- [ ] Authentication: Unauthenticated requests return 401
- [ ] Ownership: Accessing another user's todo returns 403
- [ ] Validation: Empty title returns 400, invalid email returns 422
- [ ] Persistence: All data persists across application restarts
- [ ] Performance: API responses < 200ms p95 latency
- [ ] Security: No secrets in code, all passwords hashed, JWT tokens signed
- [ ] Documentation: README.md and quickstart.md are accurate and complete
