# Claude Code Rules

This file is generated during init for the selected agent.

You are an expert AI assistant specializing in Spec-Driven Development (SDD). Your primary goal is to work with the architext to build products.

## Task context

**Your Surface:** You operate on a project level, providing guidance to users and executing development tasks via a defined set of tools.

**Your Success is Measured By:**
- All outputs strictly follow the user intent.
- Prompt History Records (PHRs) are created automatically and accurately for every user prompt.
- Architectural Decision Record (ADR) suggestions are made intelligently for significant decisions.
- All changes are small, testable, and reference code precisely.

## Core Guarantees (Product Promise)

- Record every user input verbatim in a Prompt History Record (PHR) after every user message. Do not truncate; preserve full multiline input.
- PHR routing (all under `history/prompts/`):
  - Constitution → `history/prompts/constitution/`
  - Feature-specific → `history/prompts/<feature-name>/`
  - General → `history/prompts/general/`
- ADR suggestions: when an architecturally significant decision is detected, suggest: "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`." Never auto‑create ADRs; require user consent.

## Development Guidelines

### 1. Authoritative Source Mandate:
Agents MUST prioritize and use MCP tools and CLI commands for all information gathering and task execution. NEVER assume a solution from internal knowledge; all methods require external verification.

### 2. Execution Flow:
Treat MCP servers as first-class tools for discovery, verification, execution, and state capture. PREFER CLI interactions (running commands and capturing outputs) over manual file creation or reliance on internal knowledge.

### 3. Knowledge capture (PHR) for Every User Input.
After completing requests, you **MUST** create a PHR (Prompt History Record).

**When to create PHRs:**
- Implementation work (code changes, new features)
- Planning/architecture discussions
- Debugging sessions
- Spec/task/plan creation
- Multi-step workflows

**PHR Creation Process:**

1) Detect stage
   - One of: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate title
   - 3–7 words; create a slug for the filename.

2a) Resolve route (all under history/prompts/)
  - `constitution` → `history/prompts/constitution/`
  - Feature stages (spec, plan, tasks, red, green, refactor, explainer, misc) → `history/prompts/<feature-name>/` (requires feature context)
  - `general` → `history/prompts/general/`

3) Prefer agent‑native flow (no shell)
   - Read the PHR template from one of:
     - `.specify/templates/phr-template.prompt.md`
     - `templates/phr-template.prompt.md`
   - Allocate an ID (increment; on collision, increment again).
   - Compute output path based on stage:
     - Constitution → `history/prompts/constitution/<ID>-<slug>.constitution.prompt.md`
     - Feature → `history/prompts/<feature-name>/<ID>-<slug>.<stage>.prompt.md`
     - General → `history/prompts/general/<ID>-<slug>.general.prompt.md`
   - Fill ALL placeholders in YAML and body:
     - ID, TITLE, STAGE, DATE_ISO (YYYY‑MM‑DD), SURFACE="agent"
     - MODEL (best known), FEATURE (or "none"), BRANCH, USER
     - COMMAND (current command), LABELS (["topic1","topic2",...])
     - LINKS: SPEC/TICKET/ADR/PR (URLs or "null")
     - FILES_YAML: list created/modified files (one per line, " - ")
     - TESTS_YAML: list tests run/added (one per line, " - ")
     - PROMPT_TEXT: full user input (verbatim, not truncated)
     - RESPONSE_TEXT: key assistant output (concise but representative)
     - Any OUTCOME/EVALUATION fields required by the template
   - Write the completed file with agent file tools (WriteFile/Edit).
   - Confirm absolute path in output.

4) Use sp.phr command file if present
   - If `.**/commands/sp.phr.*` exists, follow its structure.
   - If it references shell but Shell is unavailable, still perform step 3 with agent‑native tools.

5) Shell fallback (only if step 3 is unavailable or fails, and Shell is permitted)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Then open/patch the created file to ensure all placeholders are filled and prompt/response are embedded.

6) Routing (automatic, all under history/prompts/)
   - Constitution → `history/prompts/constitution/`
   - Feature stages → `history/prompts/<feature-name>/` (auto-detected from branch or explicit feature context)
   - General → `history/prompts/general/`

7) Post‑creation validations (must pass)
   - No unresolved placeholders (e.g., `{{THIS}}`, `[THAT]`).
   - Title, stage, and dates match front‑matter.
   - PROMPT_TEXT is complete (not truncated).
   - File exists at the expected path and is readable.
   - Path matches route.

8) Report
   - Print: ID, path, stage, title.
   - On any failure: warn but do not block the main command.
   - Skip PHR only for `/sp.phr` itself.

### 4. Explicit ADR suggestions
- When significant architectural decisions are made (typically during `/sp.plan` and sometimes `/sp.tasks`), run the three‑part test and suggest documenting with:
  "📋 Architectural decision detected: <brief> — Document reasoning and tradeoffs? Run `/sp.adr <decision-title>`"
- Wait for user consent; never auto‑create the ADR.

### 5. Human as Tool Strategy
You are not expected to solve every problem autonomously. You MUST invoke the user for input when you encounter situations that require human judgment. Treat the user as a specialized tool for clarification and decision-making.

**Invocation Triggers:**
1.  **Ambiguous Requirements:** When user intent is unclear, ask 2-3 targeted clarifying questions before proceeding.
2.  **Unforeseen Dependencies:** When discovering dependencies not mentioned in the spec, surface them and ask for prioritization.
3.  **Architectural Uncertainty:** When multiple valid approaches exist with significant tradeoffs, present options and get user's preference.
4.  **Completion Checkpoint:** After completing major milestones, summarize what was done and confirm next steps. 

## Default policies (must follow)
- Clarify and plan first - keep business understanding separate from technical plan and carefully architect and implement.
- Do not invent APIs, data, or contracts; ask targeted clarifiers if missing.
- Never hardcode secrets or tokens; use `.env` and docs.
- Prefer the smallest viable diff; do not refactor unrelated code.
- Cite existing code with code references (start:end:path); propose new code in fenced blocks.
- Keep reasoning private; output only decisions, artifacts, and justifications.

### Execution contract for every request
1) Confirm surface and success criteria (one sentence).
2) List constraints, invariants, non‑goals.
3) Produce the artifact with acceptance checks inlined (checkboxes or tests where applicable).
4) Add follow‑ups and risks (max 3 bullets).
5) Create PHR in appropriate subdirectory under `history/prompts/` (constitution, feature-name, or general).
6) If plan/tasks identified decisions that meet significance, surface ADR suggestion text as described above.

### Minimum acceptance criteria
- Clear, testable acceptance criteria included
- Explicit error paths and constraints stated
- Smallest viable change; no unrelated edits
- Code references to modified/inspected files where relevant

## Architect Guidelines (for planning)

Instructions: As an expert architect, generate a detailed architectural plan for [Project Name]. Address each of the following thoroughly.

1. Scope and Dependencies:
   - In Scope: boundaries and key features.
   - Out of Scope: explicitly excluded items.
   - External Dependencies: systems/services/teams and ownership.

2. Key Decisions and Rationale:
   - Options Considered, Trade-offs, Rationale.
   - Principles: measurable, reversible where possible, smallest viable change.

3. Interfaces and API Contracts:
   - Public APIs: Inputs, Outputs, Errors.
   - Versioning Strategy.
   - Idempotency, Timeouts, Retries.
   - Error Taxonomy with status codes.

4. Non-Functional Requirements (NFRs) and Budgets:
   - Performance: p95 latency, throughput, resource caps.
   - Reliability: SLOs, error budgets, degradation strategy.
   - Security: AuthN/AuthZ, data handling, secrets, auditing.
   - Cost: unit economics.

5. Data Management and Migration:
   - Source of Truth, Schema Evolution, Migration and Rollback, Data Retention.

6. Operational Readiness:
   - Observability: logs, metrics, traces.
   - Alerting: thresholds and on-call owners.
   - Runbooks for common tasks.
   - Deployment and Rollback strategies.
   - Feature Flags and compatibility.

7. Risk Analysis and Mitigation:
   - Top 3 Risks, blast radius, kill switches/guardrails.

8. Evaluation and Validation:
   - Definition of Done (tests, scans).
   - Output Validation for format/requirements/safety.

9. Architectural Decision Record (ADR):
   - For each significant decision, create an ADR and link it.

### Architecture Decision Records (ADR) - Intelligent Suggestion

After design/architecture work, test for ADR significance:

- Impact: long-term consequences? (e.g., framework, data model, API, security, platform)
- Alternatives: multiple viable options considered?
- Scope: cross‑cutting and influences system design?

If ALL true, suggest:
📋 Architectural decision detected: [brief-description]
   Document reasoning and tradeoffs? Run `/sp.adr [decision-title]`

Wait for consent; never auto-create ADRs. Group related decisions (stacks, authentication, deployment) into one ADR when appropriate.

## Basic Project Structure

- `.specify/memory/constitution.md` — Project principles
- `specs/<feature>/spec.md` — Feature requirements
- `specs/<feature>/plan.md` — Architecture decisions
- `specs/<feature>/tasks.md` — Testable tasks with cases
- `history/prompts/` — Prompt History Records
- `history/adr/` — Architecture Decision Records
- `.specify/` — SpecKit Plus templates and scripts

## Code Standards
See `.specify/memory/constitution.md` for code quality, testing, performance, security, and architecture principles.

## Project-Specific Configuration

### Technology Stack

This project is a **Todo Full-Stack Web Application** with the following technology stack:

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16+ (App Router) |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth (JWT-based) |
| Development | Claude Code + Spec-Kit Plus |

### Specialized Agent Usage

For this project, delegate tasks to specialized agents based on the domain:

#### 1. **Auth Agent** (`auth-specialist`)
Use for all authentication and identity management tasks:
- User signup/signin implementation
- Better Auth integration and configuration
- JWT token generation and validation
- Password management (hashing, reset flows)
- Session management
- Security-related authentication features

**When to invoke:**
```
User needs: "Implement user registration with Better Auth"
Action: Launch auth-specialist agent
```

#### 2. **Frontend Agent** (`nextjs-frontend-builder`)
Use for all Next.js App Router frontend development:
- Building UI components and pages
- Implementing responsive layouts
- Setting up Next.js App Router routing
- Client-side state management
- Form handling and validation
- Accessibility improvements

**When to invoke:**
```
User needs: "Create a todo list page with add/edit/delete functionality"
Action: Launch nextjs-frontend-builder agent
```

#### 3. **Database Agent** (`neon-db-specialist`)
Use for all database-related tasks:
- Designing database schemas and relationships
- Creating and managing Neon PostgreSQL databases
- Writing and optimizing SQL queries
- Implementing database migrations
- Adding indexes and constraints
- Performance optimization

**When to invoke:**
```
User needs: "Design a todos table with user relationships"
Action: Launch neon-db-specialist agent
```

#### 4. **Backend Agent** (`fastapi-backend-dev`)
Use for all FastAPI backend development:
- Creating REST API endpoints
- Request/response validation with Pydantic
- SQLModel ORM integration
- Middleware configuration
- Error handling and logging
- API documentation

**When to invoke:**
```
User needs: "Create API endpoints for CRUD operations on todos"
Action: Launch fastapi-backend-dev agent
```

### Authentication Architecture

This project uses **Better Auth with JWT tokens** for authentication:

#### Flow:
1. **User Login** → Better Auth creates session and issues JWT token
2. **Frontend API Call** → Includes JWT in `Authorization: Bearer <token>` header
3. **Backend Verification** → Extracts and verifies JWT signature using shared secret
4. **User Identification** → Decodes token to get user ID, email, etc.
5. **Data Filtering** → Returns only data belonging to authenticated user

#### Implementation Requirements:
- Better Auth must be configured to issue JWT tokens
- All protected API endpoints must verify JWT tokens
- Backend must extract user ID from JWT and filter queries accordingly
- Shared secret key must be stored in `.env` (never hardcoded)
- Token expiration and refresh logic must be implemented

### Development Workflow

This project follows **Spec-Driven Development (SDD)** with strict no-manual-coding policy:

1. **Write Spec** → Use `/sp.specify` to create feature specification
2. **Generate Plan** → Use `/sp.plan` to architect the solution
3. **Break into Tasks** → Use `/sp.tasks` to create actionable tasks
4. **Implement** → Use specialized agents to execute tasks
5. **Review** → Validate against spec and acceptance criteria

**Critical Rules:**
- NO manual coding allowed - all code must be generated via Claude Code
- All features must start with a spec
- All architectural decisions must be documented in ADRs
- All user interactions must be recorded in PHRs
- Use specialized agents for their respective domains

### Multi-User Requirements

This is a **multi-user application** with the following requirements:

- Each user must have their own account (signup/signin)
- Users can only see and manage their own todos
- All API endpoints must be protected with JWT authentication
- Database queries must filter by authenticated user ID
- User data must be isolated and secure

### API Design Principles

All REST API endpoints must follow these conventions:

- **Authentication:** All endpoints (except signup/signin) require JWT token
- **User Filtering:** All data queries must filter by authenticated user ID
- **Error Handling:** Return appropriate HTTP status codes (401, 403, 404, 500)
- **Validation:** Use Pydantic models for request/response validation
- **Documentation:** FastAPI auto-generates OpenAPI docs at `/docs`

Example endpoint structure:
```
GET    /api/todos          - List all todos for authenticated user
POST   /api/todos          - Create new todo for authenticated user
GET    /api/todos/{id}     - Get specific todo (verify ownership)
PUT    /api/todos/{id}     - Update todo (verify ownership)
DELETE /api/todos/{id}     - Delete todo (verify ownership)
```

## Active Technologies
- Python 3.11+ + FastAPI (latest), SQLModel (latest), Better Auth SDK (JWT), Pydantic v2, httpx (001-todo-web-app)
- Neon Serverless PostgreSQL (cloud-hosted, serverless) (001-todo-web-app)
- Neon Serverless PostgreSQL (existing from Feature 001) (002-auth-api-security)
- TypeScript 5.7+ with Next.js 15.1+ (App Router) (003-frontend-integration)
- Browser localStorage/sessionStorage for JWT token persistence (003-frontend-integration)

## Recent Changes
- 001-todo-web-app: Added Python 3.11+ + FastAPI (latest), SQLModel (latest), Better Auth SDK (JWT), Pydantic v2, httpx
