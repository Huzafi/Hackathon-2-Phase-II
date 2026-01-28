# Quickstart: Todo Backend Development Setup

**Feature**: Todo Full-Stack Web Application (Backend)
**Date**: 2026-01-16
**Target Audience**: Developers setting up the FastAPI backend for the first time

## Overview

This guide walks you through setting up the Todo backend application locally. The backend is a FastAPI application using SQLModel ORM and Neon Serverless PostgreSQL.

**Estimated Setup Time**: 15-20 minutes

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **pip** (comes with Python)
- **Git** (for version control)
- **Neon Account** (for PostgreSQL database) - [Sign up free](https://neon.tech/)
- **Code Editor** (VS Code, PyCharm, or similar)

**Optional but Recommended**:
- **virtualenv** or **venv** (for isolated Python environments)
- **Postman** or **curl** (for API testing)

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd phase-II

# Switch to the feature branch
git checkout 001-todo-web-app
```

---

## Step 2: Set Up Python Virtual Environment

**Why?** Virtual environments isolate project dependencies from your system Python.

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Verify activation (you should see (venv) in your prompt)
which python  # Should point to venv/bin/python
```

---

## Step 3: Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list  # Should show fastapi, sqlmodel, uvicorn, etc.
```

**Expected Dependencies**:
- `fastapi` - Web framework
- `sqlmodel` - ORM and validation
- `uvicorn[standard]` - ASGI server
- `python-jose[cryptography]` - JWT handling
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data parsing
- `pydantic-settings` - Environment configuration
- `psycopg2-binary` - PostgreSQL driver
- `pytest` - Testing framework
- `httpx` - HTTP client for testing

---

## Step 4: Set Up Neon PostgreSQL Database

### 4.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Click **"New Project"**
3. Enter project name: `todo-backend-dev`
4. Select region closest to you
5. Click **"Create Project"**

### 4.2 Get Database Connection String

1. In Neon Console, go to your project dashboard
2. Click **"Connection Details"**
3. Copy the connection string (format: `postgresql://user:password@host/database`)
4. **Important**: Save this securely - you'll need it in the next step

**Example Connection String**:
```
postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## Step 5: Configure Environment Variables

### 5.1 Create `.env` File

```bash
# In the backend/ directory, create .env file
cp .env.example .env

# Edit .env with your favorite editor
nano .env  # or code .env, vim .env, etc.
```

### 5.2 Fill in Environment Variables

```bash
# .env file contents
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

**Important Security Notes**:
- ✅ **DO**: Use a strong, random JWT secret (at least 32 characters)
- ✅ **DO**: Add `.env` to `.gitignore` (already done)
- ❌ **DON'T**: Commit `.env` to version control
- ❌ **DON'T**: Share your database credentials publicly

**Generate Strong JWT Secret** (optional):
```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Using OpenSSL
openssl rand -base64 32
```

---

## Step 6: Initialize Database Schema

The application will automatically create tables on first startup, but you can verify the connection first:

```bash
# Test database connection (from backend/ directory)
python -c "
from src.core.database import engine
from sqlmodel import SQLModel
print('Testing database connection...')
SQLModel.metadata.create_all(engine)
print('✅ Database connection successful! Tables created.')
"
```

**Expected Output**:
```
Testing database connection...
✅ Database connection successful! Tables created.
```

**If you see errors**:
- Check your `DATABASE_URL` in `.env`
- Verify Neon project is active (not paused)
- Ensure your IP is allowed (Neon allows all IPs by default)

---

## Step 7: Run the Backend Server

```bash
# From backend/ directory
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Server is now running at**: `http://localhost:8000`

---

## Step 8: Verify Installation

### 8.1 Check API Documentation

Open your browser and navigate to:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

You should see interactive API documentation with all endpoints.

### 8.2 Test Health Check (if implemented)

```bash
curl http://localhost:8000/
```

### 8.3 Test Signup Endpoint

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Expected Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "email": "test@example.com",
    "created_at": "2026-01-16T10:30:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 8.4 Test Protected Endpoint

```bash
# Save the access_token from signup response
TOKEN="<your-access-token>"

# Test /api/todos endpoint
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response** (200 OK):
```json
[]
```

---

## Step 9: Run Tests

```bash
# From backend/ directory
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v
```

**Expected Output**:
```
======================== test session starts ========================
collected 15 items

tests/test_auth.py::test_signup_success PASSED                [ 6%]
tests/test_auth.py::test_signup_duplicate_email FAILED        [13%]
...
======================== 15 passed in 2.34s ========================
```

---

## Common Issues and Troubleshooting

### Issue 1: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**: Ensure virtual environment is activated and dependencies are installed.
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Issue 2: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**: Check your `DATABASE_URL` in `.env` file.
- Verify Neon project is active (not paused)
- Check connection string format
- Ensure `?sslmode=require` is appended

### Issue 3: `jose.exceptions.JWTError: Invalid token`

**Solution**: Ensure `JWT_SECRET` in `.env` matches the secret used to sign tokens.
- Don't change `JWT_SECRET` after creating tokens (invalidates existing tokens)
- Use the same secret across all backend instances

### Issue 4: Port 8000 already in use

**Solution**: Either stop the process using port 8000 or use a different port.
```bash
# Use different port
uvicorn src.main:app --reload --port 8001

# Or find and kill process on port 8000 (Linux/Mac)
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue 5: Tests failing with database errors

**Solution**: Tests use in-memory SQLite, not Neon PostgreSQL.
- Ensure `conftest.py` is present in `tests/` directory
- Check that test fixtures are properly configured

---

## Development Workflow

### Making Changes

1. **Create a new feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes to code**:
   - Edit files in `src/` directory
   - Server auto-reloads with `--reload` flag

3. **Test your changes**:
   ```bash
   pytest
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   git push origin feature/your-feature-name
   ```

### Hot Reload

The `--reload` flag enables hot reload. Changes to Python files automatically restart the server.

**Note**: Changes to `.env` require manual server restart.

---

## Project Structure Reference

```
backend/
├── src/
│   ├── models/          # SQLModel database models
│   │   ├── user.py      # User model
│   │   └── todo.py      # Todo model
│   ├── schemas/         # Pydantic request/response schemas
│   │   ├── auth.py      # Auth schemas
│   │   └── todo.py      # Todo schemas
│   ├── api/             # FastAPI route handlers
│   │   ├── auth.py      # /api/auth/* endpoints
│   │   └── todos.py     # /api/todos/* endpoints
│   ├── core/            # Core utilities
│   │   ├── config.py    # Environment config
│   │   ├── database.py  # Database connection
│   │   └── security.py  # JWT and password hashing
│   ├── dependencies/    # FastAPI dependencies
│   │   └── auth.py      # get_current_user dependency
│   └── main.py          # Application entry point
├── tests/               # Test suite
│   ├── conftest.py      # Pytest fixtures
│   ├── test_auth.py     # Auth endpoint tests
│   └── test_todos.py    # Todo endpoint tests
├── .env                 # Environment variables (DO NOT COMMIT)
├── .env.example         # Example environment variables
├── requirements.txt     # Python dependencies
└── README.md            # Backend documentation
```

---

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/signin` | Authenticate user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Todo Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/todos` | List all user's todos | Yes |
| POST | `/api/todos` | Create new todo | Yes |
| GET | `/api/todos/{id}` | Get specific todo | Yes |
| PUT | `/api/todos/{id}` | Update todo (full) | Yes |
| PATCH | `/api/todos/{id}` | Update todo (partial) | Yes |
| DELETE | `/api/todos/{id}` | Delete todo | Yes |

**Full API documentation**: http://localhost:8000/docs

---

## Next Steps

1. **Explore API Documentation**: Visit http://localhost:8000/docs
2. **Run Tests**: Execute `pytest` to verify everything works
3. **Read Data Model**: Review `specs/001-todo-web-app/data-model.md`
4. **Review API Contracts**: Check `specs/001-todo-web-app/contracts/`
5. **Start Frontend Setup**: Follow frontend quickstart guide (separate document)

---

## Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
- **Neon Documentation**: https://neon.tech/docs/
- **Better Auth Documentation**: https://www.better-auth.com/docs/
- **Project Constitution**: `.specify/memory/constitution.md`
- **Feature Specification**: `specs/001-todo-web-app/spec.md`

---

## Getting Help

If you encounter issues not covered in this guide:

1. Check the **Troubleshooting** section above
2. Review error messages carefully (they often contain the solution)
3. Verify all prerequisites are installed correctly
4. Check that environment variables are set correctly
5. Consult the project documentation in `specs/001-todo-web-app/`

---

**Last Updated**: 2026-01-16
**Maintainer**: Todo Backend Team
