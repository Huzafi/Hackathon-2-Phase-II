# Tasks: Authentication and API Security

**Input**: Design documents from `/specs/002-auth-api-security/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/app/`
- Paths shown below follow the structure defined in plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [X] T001 Configure backend environment variables in backend/.env (JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, DATABASE_URL)
- [X] T002 Configure frontend environment variables in frontend/.env.local (NEXT_PUBLIC_API_URL, JWT_SECRET, JWT_ALGORITHM)
- [X] T003 [P] Install backend dependencies: python-jose[cryptography], passlib[bcrypt] in backend/requirements.txt
- [X] T004 [P] Install frontend dependencies: better-auth in frontend/package.json
- [X] T005 Create database migration for users table in backend/migrations/001_create_users_table.sql
- [X] T006 Run database migration to create users table in Neon PostgreSQL

**Checkpoint**: ✅ Environment configured, dependencies installed, database schema ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create core configuration module in backend/app/core/config.py (JWT settings, database URL)
- [X] T008 [P] Create User SQLModel in backend/app/auth/models.py (id, email, password_hash, created_at, updated_at)
- [X] T009 [P] Create Pydantic schemas in backend/app/auth/schemas.py (SignupRequest, SigninRequest, TokenResponse, UserResponse)
- [X] T010 Create password hashing utilities in backend/app/auth/service.py (hash_password, verify_password using passlib/bcrypt)
- [X] T011 Create JWT token utilities in backend/app/core/security.py (create_access_token, decode_token functions)
- [X] T012 Configure CORS middleware in backend/app/main.py (allow frontend origin with credentials)

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts by providing email and password. System validates input, creates account, and issues JWT token for immediate access.

**Independent Test**: Submit registration form with valid credentials (user@example.com, SecurePass123!). Verify user account created in database and valid JWT token returned. User can immediately access application.

### Implementation for User Story 1

- [X] T013 [US1] Implement user registration logic in backend/app/auth/service.py (validate email uniqueness, hash password, create user, generate JWT)
- [X] T014 [US1] Create POST /auth/signup endpoint in backend/app/auth/router.py (handle SignupRequest, return TokenResponse)
- [X] T015 [US1] Register auth router in backend/app/main.py (app.include_router with /auth prefix)
- [X] T016 [P] [US1] Configure Better Auth in frontend/app/lib/auth.ts (JWT mode, localStorage storage, HS256 algorithm)
- [X] T017 [P] [US1] Create SignupForm component in frontend/app/components/auth/SignupForm.tsx (email/password inputs, validation, error handling)
- [X] T018 [US1] Create signup page in frontend/app/auth/signup/page.tsx (render SignupForm, handle submission, redirect on success)

**Checkpoint**: ✅ User Story 1 is fully functional and testable independently. Users can register and receive JWT tokens.

**Acceptance Validation**:
1. Valid registration (user@example.com, SecurePass123!) creates account and returns JWT
2. Duplicate email registration returns "Email already registered" error
3. Weak password (less than 8 chars) returns validation error
4. Invalid email format (missing @) returns validation error before submission

---

## Phase 4: User Story 2 - Returning User Sign In (Priority: P2)

**Goal**: Enable existing users to authenticate with email and password. System verifies credentials and issues fresh JWT token for accessing their tasks.

**Independent Test**: Create user account, sign out, then sign in with same credentials. Verify valid JWT token issued and user redirected to dashboard.

### Implementation for User Story 2

- [X] T019 [US2] Implement user sign-in logic in backend/app/auth/service.py (find user by email, verify password, generate JWT)
- [X] T020 [US2] Create POST /auth/signin endpoint in backend/app/auth/router.py (handle SigninRequest, return TokenResponse)
- [X] T021 [P] [US2] Create SigninForm component in frontend/app/components/auth/SigninForm.tsx (email/password inputs, error handling)
- [X] T022 [US2] Create signin page in frontend/app/auth/signin/page.tsx (render SigninForm, handle submission, redirect on success)

**Checkpoint**: ✅ User Stories 1 AND 2 both work independently. Users can register and sign in.

**Acceptance Validation**:
1. Correct credentials return valid JWT token and redirect to dashboard
2. Incorrect password returns "Invalid credentials" error (no token issued)
3. Non-existent email returns "Invalid credentials" error (same as wrong password)
4. JWT token contains user ID and email in payload

---

## Phase 5: User Story 3 - Accessing Protected Resources (Priority: P3)

**Goal**: Enforce JWT authentication on all API endpoints. Backend verifies token signature, extracts user identity, and ensures users only access their own data.

**Independent Test**: Sign in as User A, make API requests with token, verify only User A's tasks returned. Sign in as User B, verify completely different data. Attempt cross-user access, verify 403 Forbidden.

### Implementation for User Story 3

- [X] T023 [US3] Create JWT verification dependency in backend/app/core/security.py (get_current_user_id function using HTTPBearer)
- [X] T024 [US3] Update GET /api/todos endpoint to require authentication (add user_id: int = Depends(get_current_user_id), filter by user_id)
- [X] T025 [US3] Update POST /api/todos endpoint to require authentication (add user_id dependency, associate task with authenticated user)
- [X] T026 [US3] Update PUT /api/todos/{id} endpoint to require authentication (verify ownership: task.user_id == authenticated user_id)
- [X] T027 [US3] Update DELETE /api/todos/{id} endpoint to require authentication (verify ownership before deletion)
- [X] T028 [P] [US3] Create API client wrapper in frontend/app/lib/api-client.ts (automatic JWT token attachment, 401 error handling)
- [X] T029 [US3] Update frontend todo components to use API client (replace fetch calls with apiClient.get/post/put/delete)

**Checkpoint**: ✅ All user stories are independently functional. Protected resources enforce authentication and user isolation.

**Acceptance Validation**:
1. Valid JWT token in Authorization header returns user's own tasks only
2. POST request with valid token creates task associated with authenticated user
3. User A attempting to access User B's task returns 403 Forbidden
4. DELETE request with valid token deletes user's own task successfully

---

## Phase 6: User Story 4 - Handling Unauthorized Access (Priority: P4)

**Goal**: Reject all requests without valid JWT tokens. Return 401 Unauthorized with clear error messages for missing, invalid, or expired tokens.

**Independent Test**: Make API requests without token, with malformed token, and with expired token. Verify all return 401 errors with appropriate messages.

### Implementation for User Story 4

- [X] T030 [US4] Add error handling for missing Authorization header in backend/app/core/security.py (return 401 "Authentication required")
- [X] T031 [US4] Add error handling for malformed JWT tokens in backend/app/core/security.py (return 401 "Invalid token")
- [X] T032 [US4] Add error handling for expired JWT tokens in backend/app/core/security.py (return 401 "Token expired")
- [X] T033 [US4] Add error handling for invalid signature in backend/app/core/security.py (return 401 "Invalid token signature")
- [X] T034 [US4] Update frontend API client to handle 401 responses in frontend/app/lib/api-client.ts (clear token, redirect to signin)

**Checkpoint**: ✅ All user stories complete. Security boundary enforcement working correctly.

**Acceptance Validation**:
1. Request without Authorization header returns 401 "Authentication required"
2. Request with malformed token returns 401 "Invalid token"
3. Request with expired token returns 401 "Token expired"
4. Request with wrong secret signature returns 401 "Invalid token signature"

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T035 [P] Add password validation feedback to SignupForm (real-time strength indicator)
- [X] T036 [P] Add loading states to authentication forms (disable submit during API calls)
- [X] T037 [P] Add email normalization (lowercase) before storage in backend/app/auth/service.py
- [X] T038 Validate implementation against quickstart.md verification checklist (20 items)
- [X] T039 [P] Update .gitignore to exclude .env files (if not already present)
- [X] T040 Document JWT secret generation command in README.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (but typically done after for logical flow)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires JWT verification utilities from Foundational phase
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Enhances error handling from US3

### Within Each User Story

- Backend service logic before router endpoints
- Backend endpoints before frontend integration
- Core implementation before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T003 (backend deps) and T004 (frontend deps) can run in parallel
- **Foundational Phase**: T008 (User model) and T009 (Pydantic schemas) can run in parallel
- **User Story 1**: T016 (Better Auth config) and T017 (SignupForm) can run in parallel
- **User Story 2**: T021 (SigninForm) can run in parallel with T019-T020 (backend signin)
- **User Story 3**: T028 (API client) can run in parallel with T023-T027 (backend endpoints)
- **Polish Phase**: T035, T036, T037, T039, T040 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, launch these tasks together:

# Backend signup endpoint (sequential within this group):
Task T013: "Implement user registration logic in backend/app/auth/service.py"
Task T014: "Create POST /auth/signup endpoint in backend/app/auth/router.py"
Task T015: "Register auth router in backend/app/main.py"

# Frontend signup UI (can run in parallel with backend):
Task T016: "Configure Better Auth in frontend/app/lib/auth.ts"
Task T017: "Create SignupForm component in frontend/app/components/auth/SignupForm.tsx"
Task T018: "Create signup page in frontend/app/auth/signup/page.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Backend JWT middleware and endpoint updates (sequential):
Task T023: "Create JWT verification dependency in backend/app/core/security.py"
Task T024-T027: "Update all /api/todos endpoints to require authentication"

# Frontend API client (can run in parallel with backend):
Task T028: "Create API client wrapper in frontend/app/lib/api-client.ts"
Task T029: "Update frontend todo components to use API client"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T012) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T013-T018)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Register new user with valid credentials
   - Verify JWT token issued
   - Verify user can access application
5. Deploy/demo if ready

**MVP Scope**: 18 tasks (T001-T018)
**Estimated Effort**: 1-2 days for single developer
**Value Delivered**: Users can create accounts and receive authentication tokens

### Incremental Delivery

1. **Foundation** (T001-T012) → Environment and core utilities ready
2. **MVP** (T013-T018) → User registration working → Deploy/Demo
3. **Sign In** (T019-T022) → Returning users can authenticate → Deploy/Demo
4. **Protected Resources** (T023-T029) → Security enforcement working → Deploy/Demo
5. **Unauthorized Handling** (T030-T034) → Complete security boundary → Deploy/Demo
6. **Polish** (T035-T040) → Production-ready → Final Deploy

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T012)
2. **Once Foundational is done:**
   - Developer A: User Story 1 (T013-T018) - Registration
   - Developer B: User Story 2 (T019-T022) - Sign In
   - Developer C: User Story 3 (T023-T029) - Protected Resources
3. **Stories complete and integrate independently**
4. **Team completes User Story 4 together** (T030-T034) - Error handling
5. **Team completes Polish together** (T035-T040)

---

## Task Summary

**Total Tasks**: 40
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 6 tasks (BLOCKING)
- Phase 3 (User Story 1 - Registration): 6 tasks 🎯 MVP
- Phase 4 (User Story 2 - Sign In): 4 tasks
- Phase 5 (User Story 3 - Protected Resources): 7 tasks
- Phase 6 (User Story 4 - Unauthorized Access): 5 tasks
- Phase 7 (Polish): 6 tasks

**Parallel Opportunities**: 12 tasks marked [P] can run in parallel with other tasks

**Independent Test Criteria**:
- **US1**: Register user → Verify account created and JWT issued
- **US2**: Sign in → Verify JWT issued and dashboard access
- **US3**: Make authenticated requests → Verify user isolation enforced
- **US4**: Make unauthorized requests → Verify 401 errors returned

**Suggested MVP Scope**: Phases 1-3 (T001-T018) - User registration with JWT tokens

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are NOT included as they were not explicitly requested in the specification
