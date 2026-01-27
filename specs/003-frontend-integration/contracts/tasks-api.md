# API Contracts: Task Management Endpoints

**Feature**: 003-frontend-integration
**Date**: 2026-01-21
**Base URL**: `http://localhost:8000` (development)

## Overview

Task management endpoints for CRUD operations on todo items. All endpoints require JWT authentication and automatically filter tasks by authenticated user.

---

## GET /api/tasks

Retrieve all tasks for the authenticated user.

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**: None (filtering by user_id is automatic based on JWT)

### Response

**Success (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2026-01-21T10:30:00Z",
      "updated_at": "2026-01-21T10:30:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Finish project",
      "description": "",
      "completed": true,
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2026-01-20T15:00:00Z",
      "updated_at": "2026-01-21T09:00:00Z"
    }
  ],
  "total": 2
}
```

**Error (401 Unauthorized)**:
```json
{
  "detail": "Invalid or expired token"
}
```

### Frontend Implementation

```typescript
async function getTasks(token: string): Promise<Task[]> {
  const response = await apiClient('/api/tasks', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  const data = await response.json();
  return data.tasks;
}
```

---

## POST /api/tasks

Create a new task for the authenticated user.

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**TypeScript Type**:
```typescript
interface CreateTaskRequest {
  title: string;
  description?: string;
}
```

### Response

**Success (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2026-01-21T10:30:00Z",
  "updated_at": "2026-01-21T10:30:00Z"
}
```

**Error (400 Bad Request)**:
```json
{
  "detail": "Title is required"
}
```

**Error (401 Unauthorized)**:
```json
{
  "detail": "Invalid or expired token"
}
```

**Error (422 Unprocessable Entity)**:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "Field required",
      "type": "missing"
    }
  ]
}
```

### Validation Rules

- Title: Required, 1-200 characters
- Description: Optional, max 1000 characters
- user_id: Automatically set from JWT token (not in request body)

### Frontend Implementation

```typescript
async function createTask(token: string, data: CreateTaskRequest): Promise<Task> {
  const response = await apiClient('/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create task');
  }

  return response.json();
}
```

---

## GET /api/tasks/{task_id}

Retrieve a specific task by ID (must belong to authenticated user).

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `task_id` (string, UUID): ID of the task to retrieve

### Response

**Success (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2026-01-21T10:30:00Z",
  "updated_at": "2026-01-21T10:30:00Z"
}
```

**Error (401 Unauthorized)**:
```json
{
  "detail": "Invalid or expired token"
}
```

**Error (403 Forbidden)**:
```json
{
  "detail": "Not authorized to access this task"
}
```

**Error (404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

### Frontend Implementation

```typescript
async function getTask(token: string, taskId: string): Promise<Task> {
  const response = await apiClient(`/api/tasks/${taskId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Task not found');
    }
    if (response.status === 403) {
      throw new Error('Not authorized to access this task');
    }
    throw new Error('Failed to fetch task');
  }

  return response.json();
}
```

---

## PUT /api/tasks/{task_id}

Update an existing task (must belong to authenticated user).

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters**:
- `task_id` (string, UUID): ID of the task to update

**Body** (partial update supported):
```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken",
  "completed": true
}
```

**TypeScript Type**:
```typescript
interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}
```

### Response

**Success (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken",
  "completed": true,
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2026-01-21T10:30:00Z",
  "updated_at": "2026-01-21T11:45:00Z"
}
```

**Error (400 Bad Request)**:
```json
{
  "detail": "At least one field must be provided"
}
```

**Error (401 Unauthorized)**:
```json
{
  "detail": "Invalid or expired token"
}
```

**Error (403 Forbidden)**:
```json
{
  "detail": "Not authorized to update this task"
}
```

**Error (404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

### Validation Rules

- At least one field (title, description, or completed) must be provided
- Title: 1-200 characters (if provided)
- Description: Max 1000 characters (if provided)
- Completed: Boolean (if provided)

### Frontend Implementation

```typescript
async function updateTask(
  token: string,
  taskId: string,
  data: UpdateTaskRequest
): Promise<Task> {
  const response = await apiClient(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update task');
  }

  return response.json();
}
```

---

## DELETE /api/tasks/{task_id}

Delete a task (must belong to authenticated user).

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `task_id` (string, UUID): ID of the task to delete

### Response

**Success (204 No Content)**:
```
(empty response body)
```

**Error (401 Unauthorized)**:
```json
{
  "detail": "Invalid or expired token"
}
```

**Error (403 Forbidden)**:
```json
{
  "detail": "Not authorized to delete this task"
}
```

**Error (404 Not Found)**:
```json
{
  "detail": "Task not found"
}
```

### Frontend Implementation

```typescript
async function deleteTask(token: string, taskId: string): Promise<void> {
  const response = await apiClient(`/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete task');
  }
}
```

---

## Error Handling

All task endpoints may return the following errors:

| Status Code | Meaning | Frontend Action |
|-------------|---------|-----------------|
| 400 | Bad Request (validation error) | Show error message to user |
| 401 | Unauthorized (invalid/expired token) | Clear token, redirect to signin |
| 403 | Forbidden (task belongs to another user) | Show "Not authorized" message |
| 404 | Not Found (task doesn't exist) | Show "Task not found" message |
| 422 | Validation Error | Show field-specific validation errors |
| 500 | Internal Server Error | Show generic error, log to console |

---

## User Isolation

**Critical Security Requirement**: All task endpoints MUST filter by authenticated user ID extracted from JWT token. The backend enforces this automatically:

1. JWT token is decoded to extract `user_id`
2. All queries include `WHERE user_id = <authenticated_user_id>`
3. Users can ONLY access their own tasks
4. Attempting to access another user's task returns 403 Forbidden

Frontend does NOT need to send `user_id` in requests - it's automatically extracted from the JWT token by the backend.

---

## Testing Checklist

- [ ] GET /api/tasks returns only authenticated user's tasks
- [ ] POST /api/tasks creates task associated with authenticated user
- [ ] GET /api/tasks/{id} returns task if it belongs to authenticated user
- [ ] GET /api/tasks/{id} returns 403 if task belongs to another user
- [ ] PUT /api/tasks/{id} updates task if it belongs to authenticated user
- [ ] PUT /api/tasks/{id} returns 403 if task belongs to another user
- [ ] DELETE /api/tasks/{id} deletes task if it belongs to authenticated user
- [ ] DELETE /api/tasks/{id} returns 403 if task belongs to another user
- [ ] All endpoints return 401 with invalid/expired token
- [ ] All endpoints return 401 without Authorization header
