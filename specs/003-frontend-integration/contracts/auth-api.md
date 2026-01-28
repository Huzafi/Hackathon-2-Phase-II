# API Contracts: Authentication Endpoints

**Feature**: 003-frontend-integration
**Date**: 2026-01-21
**Base URL**: `http://localhost:8000` (development)

## Overview

Authentication endpoints for user signup, signin, and token management. All endpoints use JWT tokens for authentication.

---

## POST /api/auth/signup

Create a new user account.

### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**TypeScript Type**:
```typescript
interface SignupRequest {
  email: string;
  password: string;
}
```

### Response

**Success (201 Created)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2026-01-21T10:30:00Z"
  }
}
```

**Error (400 Bad Request)**:
```json
{
  "detail": "Email already registered"
}
```

**Error (422 Unprocessable Entity)**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error"
    }
  ]
}
```

### Validation Rules

- Email: Required, valid email format
- Password: Required, minimum 8 characters

### Frontend Implementation

```typescript
async function signup(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Signup failed');
  }

  return response.json();
}
```

---

## POST /api/auth/signin

Authenticate an existing user.

### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**TypeScript Type**:
```typescript
interface SigninRequest {
  email: string;
  password: string;
}
```

### Response

**Success (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2026-01-21T10:30:00Z"
  }
}
```

**Error (401 Unauthorized)**:
```json
{
  "detail": "Invalid email or password"
}
```

**Error (422 Unprocessable Entity)**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Field required",
      "type": "missing"
    }
  ]
}
```

### Validation Rules

- Email: Required
- Password: Required

### Frontend Implementation

```typescript
async function signin(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Signin failed');
  }

  return response.json();
}
```

---

## GET /api/auth/me

Get current authenticated user details.

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

### Response

**Success (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "created_at": "2026-01-21T10:30:00Z"
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
async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get user details');
  }

  return response.json();
}
```

---

## Error Handling

All authentication endpoints may return the following errors:

| Status Code | Meaning | Frontend Action |
|-------------|---------|-----------------|
| 400 | Bad Request (e.g., email already exists) | Show error message to user |
| 401 | Unauthorized (invalid credentials or token) | Clear token, redirect to signin |
| 422 | Validation Error | Show field-specific validation errors |
| 500 | Internal Server Error | Show generic error, log to console |

---

## JWT Token Structure

The JWT token contains the following claims:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // User ID
  "email": "user@example.com",
  "exp": 1737456000  // Expiration timestamp (Unix)
}
```

**Token Expiration**: 24 hours from issuance

**Frontend Storage**: Store in localStorage or httpOnly cookie

**Token Refresh**: Not implemented in MVP (user must re-authenticate after expiration)

---

## Security Considerations

1. **HTTPS Required**: All authentication endpoints MUST use HTTPS in production
2. **Password Transmission**: Passwords sent in plain text over HTTPS (encrypted in transit)
3. **Token Storage**: Store JWT in httpOnly cookie to prevent XSS attacks (preferred) or localStorage (less secure)
4. **Token Expiration**: Frontend must handle 401 errors and redirect to signin
5. **CORS**: Backend must allow frontend origin in CORS configuration

---

## Testing Checklist

- [ ] Signup with valid email and password returns 201 and JWT token
- [ ] Signup with existing email returns 400 error
- [ ] Signup with invalid email format returns 422 error
- [ ] Signup with short password returns 422 error
- [ ] Signin with valid credentials returns 200 and JWT token
- [ ] Signin with invalid credentials returns 401 error
- [ ] GET /api/auth/me with valid token returns user details
- [ ] GET /api/auth/me with invalid token returns 401 error
- [ ] GET /api/auth/me without token returns 401 error
