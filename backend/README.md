# Todo Backend API

A FastAPI-based backend for a multi-user todo application with JWT authentication.

## Features

- User registration and authentication (JWT-based)
- CRUD operations for todos
- Multi-user data isolation
- RESTful API design
- SQLModel ORM with Neon Serverless PostgreSQL

## Quick Start

See [quickstart.md](../specs/001-todo-web-app/quickstart.md) for detailed setup instructions.

### Prerequisites

- Python 3.11+
- Neon PostgreSQL account
- pip and virtualenv

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Run server
uvicorn src.main:app --reload
```

### API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── src/
│   ├── models/          # SQLModel database models
│   ├── schemas/         # Pydantic request/response schemas
│   ├── api/             # FastAPI route handlers
│   ├── core/            # Core utilities (config, database, security)
│   ├── dependencies/    # FastAPI dependencies
│   └── main.py          # Application entry point
├── tests/               # Test suite
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Authenticate user
- `GET /api/auth/me` - Get current user

### Todos
- `GET /api/todos` - List all user's todos
- `POST /api/todos` - Create new todo
- `GET /api/todos/{id}` - Get specific todo
- `PUT /api/todos/{id}` - Update todo (full)
- `PATCH /api/todos/{id}` - Update todo (partial)
- `DELETE /api/todos/{id}` - Delete todo

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v
```

## Security

- All passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- User data isolation enforced at query level
- Environment variables for secrets (never committed)

## Documentation

- [Feature Specification](../specs/001-todo-web-app/spec.md)
- [Implementation Plan](../specs/001-todo-web-app/plan.md)
- [Data Model](../specs/001-todo-web-app/data-model.md)
- [API Contracts](../specs/001-todo-web-app/contracts/)
- [Quickstart Guide](../specs/001-todo-web-app/quickstart.md)

## License

See project root for license information.
