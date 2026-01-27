# Todo Full-Stack Web Application

A secure, multi-user todo application with Next.js frontend, FastAPI backend, and JWT authentication.

## Features

- **User Authentication**: Secure signup and signin with JWT tokens
- **Multi-User Support**: Each user has their own isolated todo list
- **CRUD Operations**: Create, read, update, and delete todos
- **Real-time Updates**: Immediate feedback on all operations
- **Responsive Design**: Works on desktop and mobile devices
- **Security First**: JWT authentication, password hashing, user isolation

## Technology Stack

### Frontend
- **Next.js 15+** (App Router)
- **React 19**
- **TypeScript**
- **Better Auth** (JWT mode)

### Backend
- **FastAPI** (Python 3.11+)
- **SQLModel** (ORM)
- **Neon Serverless PostgreSQL**
- **python-jose** (JWT)
- **passlib** (bcrypt password hashing)

## Project Structure

```
phase-II/
├── backend/
│   ├── src/
│   │   ├── api/           # API endpoints
│   │   │   ├── auth.py    # Authentication endpoints
│   │   │   └── todos.py   # Todo CRUD endpoints
│   │   ├── core/          # Core utilities
│   │   │   ├── config.py  # Configuration
│   │   │   ├── database.py # Database connection
│   │   │   └── security.py # JWT & password utilities
│   │   ├── dependencies/  # FastAPI dependencies
│   │   │   └── auth.py    # Authentication dependency
│   │   ├── models/        # SQLModel database models
│   │   │   ├── user.py    # User model
│   │   │   └── todo.py    # Todo model
│   │   ├── schemas/       # Pydantic schemas
│   │   │   ├── auth.py    # Auth request/response schemas
│   │   │   └── todo.py    # Todo request/response schemas
│   │   └── main.py        # FastAPI application
│   ├── tests/             # Backend tests
│   ├── .env               # Environment variables (not in git)
│   └── requirements.txt   # Python dependencies
│
└── frontend/
    ├── app/
    │   ├── auth/
    │   │   ├── signin/    # Sign in page
    │   │   └── signup/    # Sign up page
    │   ├── todos/         # Todo list page
    │   ├── layout.tsx     # Root layout
    │   ├── page.tsx       # Home page (redirects to todos)
    │   └── globals.css    # Global styles
    ├── lib/
    │   └── api-client.ts  # API client with JWT handling
    ├── .env.local         # Environment variables (not in git)
    ├── package.json       # Node dependencies
    └── tsconfig.json      # TypeScript configuration
```

## Setup Instructions

### Prerequisites

- **Python 3.11+** installed
- **Node.js 18+** and npm installed
- **Neon PostgreSQL** database provisioned
- **Git** for version control

### 1. Clone Repository

```bash
git clone <repository-url>
cd phase-II
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create `backend/.env`:

```bash
# Database Configuration
DATABASE_URL='postgresql://user:password@host/database?sslmode=require'

# JWT Configuration
JWT_SECRET=<your-secret-key>
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

**Generate a secure JWT secret:**

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### Run Database Migrations

The database tables are created automatically on application startup.

#### Start Backend Server

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create `frontend/.env.local`:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# JWT Configuration (MUST match backend)
JWT_SECRET=<same-secret-as-backend>
JWT_ALGORITHM=HS256
```

**CRITICAL**: The `JWT_SECRET` must be **identical** in both frontend and backend.

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## Usage

### 1. Create Account

1. Navigate to `http://localhost:3000`
2. Click "Sign up" or go to `/auth/signup`
3. Enter email and password (minimum 8 characters)
4. Click "Sign Up"
5. You'll be automatically signed in and redirected to your todos

### 2. Sign In

1. Go to `/auth/signin`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to your todo list

### 3. Manage Todos

- **Create**: Enter title and optional description, click "Create Todo"
- **Complete**: Click the checkbox to mark as complete/incomplete
- **Delete**: Click "Delete" button and confirm

### 4. Sign Out

Click "Sign Out" button in the top right corner.

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in existing user
- `GET /api/auth/me` - Get current user info (requires auth)

### Todos

All todo endpoints require JWT authentication via `Authorization: Bearer <token>` header.

- `GET /api/todos` - List all todos for authenticated user
- `POST /api/todos` - Create new todo
- `GET /api/todos/{id}` - Get specific todo
- `PUT /api/todos/{id}` - Update todo (full update)
- `PATCH /api/todos/{id}` - Partially update todo
- `DELETE /api/todos/{id}` - Delete todo

## Security Features

### Authentication
- JWT tokens with 24-hour expiration
- Tokens stored in localStorage (client-side)
- Automatic token attachment to all API requests
- 401 handling with automatic redirect to signin

### Password Security
- bcrypt hashing with cost factor 12
- Minimum 8 character password requirement
- Passwords never stored in plaintext
- Passwords never logged or exposed

### User Isolation
- All database queries filtered by authenticated user ID
- Users can only access their own todos
- Ownership verification on all update/delete operations
- 403 Forbidden for cross-user access attempts

### API Security
- All endpoints (except signup/signin) require authentication
- JWT signature verification on every request
- CORS configured for frontend origin
- Input validation with Pydantic schemas

## Testing

### Manual Testing

#### Test User Registration
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123"}'
```

#### Test User Sign In
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123"}'
```

#### Test Protected Endpoint
```bash
TOKEN="<your-jwt-token>"
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer $TOKEN"
```

#### Test Unauthorized Access
```bash
curl -X GET http://localhost:8000/api/todos
# Expected: 401 Unauthorized
```

### Automated Testing

Backend tests:
```bash
cd backend
pytest tests/ -v
```

## Troubleshooting

### Issue: "Invalid token" errors

**Cause**: JWT secret mismatch between frontend and backend

**Solution**:
1. Verify `JWT_SECRET` is identical in both `.env` files
2. Restart both servers
3. Clear localStorage and re-authenticate

### Issue: CORS errors in browser

**Cause**: Backend CORS middleware not configured

**Solution**:
1. Verify `FRONTEND_URL` in backend `.env`
2. Check CORS middleware in `backend/src/main.py`
3. Ensure `allow_credentials=True` is set

### Issue: "Email already registered"

**Cause**: User already exists from previous test

**Solution**:
```sql
-- Delete test users (development only)
DELETE FROM users WHERE email LIKE '%@example.com';
```

### Issue: Cannot connect to database

**Cause**: Invalid DATABASE_URL or network issues

**Solution**:
1. Verify Neon PostgreSQL connection string
2. Check database is accessible
3. Ensure SSL mode is configured correctly

## Development Workflow

This project follows **Spec-Driven Development (SDD)**:

1. **Specification** → `specs/002-auth-api-security/spec.md`
2. **Planning** → `specs/002-auth-api-security/plan.md`
3. **Tasks** → `specs/002-auth-api-security/tasks.md`
4. **Implementation** → Generated via Claude Code agents
5. **Testing** → Verification against acceptance criteria

## Architecture Decisions

Key architectural decisions are documented in:
- `specs/002-auth-api-security/research.md` - Technical research
- `specs/002-auth-api-security/data-model.md` - Database schema
- `specs/002-auth-api-security/contracts/` - API contracts

## Contributing

This project uses zero manual coding - all code is generated via Claude Code specialized agents:
- `auth-specialist` - Authentication implementation
- `fastapi-backend-dev` - Backend API development
- `nextjs-frontend-builder` - Frontend development
- `neon-db-specialist` - Database operations

## License

MIT License

## Support

For issues or questions, refer to:
- API Documentation: `http://localhost:8000/docs`
- Quickstart Guide: `specs/002-auth-api-security/quickstart.md`
- Specification: `specs/002-auth-api-security/spec.md`
