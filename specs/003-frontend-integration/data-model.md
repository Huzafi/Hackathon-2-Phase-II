# Data Model: Frontend Application and Integration

**Feature**: 003-frontend-integration
**Date**: 2026-01-21
**Status**: Phase 1 - Data Model

## Overview

This document defines the TypeScript types and interfaces used in the Next.js frontend application. These types represent the data structures exchanged with the FastAPI backend and used within the frontend application.

---

## Core Entities

### User

Represents an authenticated user in the system.

```typescript
interface User {
  id: string;           // UUID from backend
  email: string;        // User's email address
  created_at: string;   // ISO 8601 timestamp
}
```

**Source**: Backend API `/api/auth/me` endpoint
**Usage**: Stored in auth context after successful signin/signup
**Validation**: Email must be valid format, id must be UUID

---

### Task

Represents a todo item belonging to a user.

```typescript
interface Task {
  id: string;              // UUID from backend
  title: string;           // Task title (required, max 200 chars)
  description: string;     // Task description (optional, max 1000 chars)
  completed: boolean;      // Completion status
  user_id: string;         // UUID of owner (enforced by backend)
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}
```

**Source**: Backend API `/api/tasks` endpoints
**Usage**: Displayed in task list, task detail, and edit forms
**Validation**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `completed`: Boolean, defaults to false
- Timestamps are read-only (set by backend)

---

## Request/Response Types

### Authentication

#### SignupRequest
```typescript
interface SignupRequest {
  email: string;        // Valid email format
  password: string;     // Min 8 characters
}
```

**Validation**:
- Email: Must match email regex pattern
- Password: Minimum 8 characters, recommended to include uppercase, lowercase, number

#### SigninRequest
```typescript
interface SigninRequest {
  email: string;
  password: string;
}
```

#### AuthResponse
```typescript
interface AuthResponse {
  access_token: string;  // JWT token
  token_type: string;    // "bearer"
  user: User;            // User details
}
```

**Usage**: Returned by `/api/auth/signup` and `/api/auth/signin`
**Storage**: `access_token` stored in localStorage or httpOnly cookie

---

### Task Operations

#### CreateTaskRequest
```typescript
interface CreateTaskRequest {
  title: string;           // Required, 1-200 chars
  description?: string;    // Optional, max 1000 chars
}
```

**Validation**:
- `title`: Required, non-empty, max 200 characters
- `description`: Optional, max 1000 characters

#### UpdateTaskRequest
```typescript
interface UpdateTaskRequest {
  title?: string;          // Optional, 1-200 chars
  description?: string;    // Optional, max 1000 chars
  completed?: boolean;     // Optional
}
```

**Note**: At least one field must be provided. Partial updates supported.

#### TaskListResponse
```typescript
interface TaskListResponse {
  tasks: Task[];
  total: number;
}
```

**Usage**: Returned by `GET /api/tasks`

---

## Frontend-Only Types

### UI State Types

#### LoadingState
```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

**Usage**: Track async operation status in components

#### FormState
```typescript
interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isValid: boolean;
}
```

**Usage**: Generic form state management

#### TaskFormData
```typescript
interface TaskFormData {
  title: string;
  description: string;
}
```

**Usage**: Form data for create/edit task forms

---

### Error Types

#### ApiError
```typescript
interface ApiError {
  message: string;       // User-friendly error message
  status: number;        // HTTP status code
  detail?: string;       // Technical details (optional)
}
```

**Usage**: Standardized error format from API client

#### ValidationError
```typescript
interface ValidationError {
  field: string;         // Field name
  message: string;       // Error message
}
```

**Usage**: Client-side form validation errors

---

## Type Guards

Type guards for runtime type checking:

```typescript
function isTask(obj: any): obj is Task {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.user_id === 'string'
  );
}

function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string'
  );
}

function isAuthResponse(obj: any): obj is AuthResponse {
  return (
    typeof obj === 'object' &&
    typeof obj.access_token === 'string' &&
    typeof obj.token_type === 'string' &&
    isUser(obj.user)
  );
}
```

---

## Validation Rules

### Client-Side Validation

**Email Validation**:
```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
}
```

**Password Validation**:
```typescript
function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}
```

**Task Title Validation**:
```typescript
function validateTaskTitle(title: string): string | null {
  if (!title || title.trim().length === 0) return 'Title is required';
  if (title.length > 200) return 'Title must be 200 characters or less';
  return null;
}
```

**Task Description Validation**:
```typescript
function validateTaskDescription(description: string): string | null {
  if (description && description.length > 1000) {
    return 'Description must be 1000 characters or less';
  }
  return null;
}
```

---

## State Management

### Auth Context

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signout: () => void;
}
```

**Usage**: Global authentication state via React Context

### Task Context (Optional)

```typescript
interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: ApiError | null;
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<Task>;
}
```

**Note**: Task context is optional. Can use direct API calls in components instead.

---

## Type Organization

Types should be organized in the following structure:

```
frontend/types/
├── index.ts           # Re-exports all types
├── entities.ts        # Core entities (User, Task)
├── api.ts             # Request/response types
├── ui.ts              # UI state types
├── errors.ts          # Error types
└── validation.ts      # Validation functions and types
```

---

## Backend Compatibility

All types must match the backend API contracts defined in Spec 2. Key compatibility notes:

1. **Timestamps**: Backend returns ISO 8601 strings, not Date objects
2. **IDs**: Backend uses UUIDs (strings), not integers
3. **Booleans**: Backend uses `true`/`false`, not `1`/`0`
4. **Null vs Undefined**: Backend may return `null`, frontend uses `undefined` for optional fields
5. **Snake Case vs Camel Case**: Backend uses snake_case, frontend uses snake_case to match (no conversion needed)

---

## Next Steps

Data model is complete. Proceed to:
1. Generate API contracts in `contracts/` directory
2. Generate `quickstart.md` with setup instructions
3. Update agent context with new technologies
