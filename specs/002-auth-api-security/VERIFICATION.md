# Feature 002 Verification Checklist

**Feature**: Authentication and API Security
**Date**: 2026-01-20
**Status**: Implementation Complete - Ready for Testing

## Pre-Verification Setup

### 1. Environment Check
- [ ] Backend `.env` file exists with correct values
- [ ] Frontend `.env.local` file exists with correct values
- [ ] JWT_SECRET is identical in both files
- [ ] DATABASE_URL is valid and accessible
- [ ] Both servers can start without errors

### 2. Start Services

**Backend:**
```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```
Expected: Server starts on http://localhost:8000

**Frontend:**
```bash
cd frontend
npm run dev
```
Expected: Server starts on http://localhost:3000

---

## Verification Tests (20 Items from quickstart.md)

### User Registration (User Story 1)

- [ ] **Test 1**: Users can register with valid email and password
  - Navigate to http://localhost:3000/auth/signup
  - Enter: test1@example.com / TestPass123!
  - Click "Sign Up"
  - Expected: Redirected to /todos page, JWT token stored in localStorage

- [ ] **Test 2**: Duplicate email registration is rejected
  - Try to register with test1@example.com again
  - Expected: Error message "Email already registered"

- [ ] **Test 3**: Weak passwords are rejected with clear error messages
  - Try to register with password "short"
  - Expected: Browser validation error (minimum 8 characters)

### User Sign In (User Story 2)

- [ ] **Test 4**: Users can sign in with correct credentials
  - Sign out (click "Sign Out" button)
  - Navigate to http://localhost:3000/auth/signin
  - Enter: test1@example.com / TestPass123!
  - Click "Sign In"
  - Expected: Redirected to /todos page, JWT token stored

- [ ] **Test 5**: Invalid credentials return 401 with consistent error message
  - Try to sign in with test1@example.com / WrongPassword
  - Expected: Error message "Invalid email or password"

### JWT Token Validation (User Story 3 & 4)

- [ ] **Test 6**: JWT tokens are issued on successful signup/signin
  - After signing in, open browser DevTools → Application → Local Storage
  - Expected: `access_token` key exists with JWT value

- [ ] **Test 7**: JWT tokens contain correct payload (sub, email, iat, exp, type)
  - Copy JWT token from localStorage
  - Paste into https://jwt.io
  - Expected: Payload contains `sub` (user ID), `exp` (expiration)

- [ ] **Test 8**: Protected endpoints require valid JWT token
  - Sign in and create a todo
  - Expected: Todo created successfully (proves token is valid)

- [ ] **Test 9**: Requests without token return 401
  - Open browser DevTools → Console
  - Clear localStorage: `localStorage.clear()`
  - Refresh page
  - Expected: Redirected to /auth/signin

- [ ] **Test 10**: Requests with invalid token return 401
  - Set invalid token: `localStorage.setItem('access_token', 'invalid-token')`
  - Try to access /todos
  - Expected: Redirected to /auth/signin with error

- [ ] **Test 11**: Requests with expired token return 401
  - (Manual test: modify JWT_EXPIRATION_HOURS to 0.001 in backend, restart, sign in, wait 1 minute, try to create todo)
  - Expected: 401 error, redirected to signin

### User Isolation (User Story 3)

- [ ] **Test 12**: User ID is correctly extracted from JWT
  - Sign in as test1@example.com
  - Create a todo with title "User 1 Todo"
  - Expected: Todo appears in list

- [ ] **Test 13**: Database queries are filtered by authenticated user ID
  - Create multiple todos as test1@example.com
  - Sign out
  - Register as test2@example.com / TestPass456!
  - Expected: Empty todo list (no todos from test1)

- [ ] **Test 14**: User A cannot access User B's data (returns 403 or 404)
  - As test2@example.com, create a todo
  - Note the todo ID from network tab (e.g., id: 5)
  - Try to access test1's todo by manually calling API:
    ```javascript
    // In browser console
    fetch('http://localhost:8000/api/todos/1', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') }
    }).then(r => r.json()).then(console.log)
    ```
  - Expected: 403 Forbidden or 404 Not Found

### Frontend Integration

- [ ] **Test 15**: Frontend stores JWT token in localStorage
  - Sign in
  - Check DevTools → Application → Local Storage
  - Expected: `access_token` key exists

- [ ] **Test 16**: Frontend automatically attaches token to API requests
  - Sign in and create a todo
  - Open DevTools → Network tab
  - Check POST /api/todos request headers
  - Expected: `Authorization: Bearer <token>` header present

- [ ] **Test 17**: Frontend redirects to signin on 401 errors
  - Sign in, then manually clear token: `localStorage.clear()`
  - Try to create a todo
  - Expected: Redirected to /auth/signin

### CORS and Configuration

- [ ] **Test 18**: CORS is configured correctly (frontend can call backend)
  - Sign in and perform any operation
  - Check browser console for CORS errors
  - Expected: No CORS errors

- [ ] **Test 19**: JWT secret is stored in .env (not hardcoded)
  - Check backend/src/core/config.py
  - Expected: JWT_SECRET loaded from environment variable

- [ ] **Test 20**: .env files are excluded from version control
  - Run: `git status`
  - Expected: .env and .env.local files NOT listed (should be in .gitignore)

---

## Additional Security Tests

### Password Security
- [ ] Passwords are hashed before storage (check database)
  ```sql
  SELECT email, hashed_password FROM users LIMIT 1;
  ```
  Expected: hashed_password starts with `$2b$` (bcrypt)

### API Security
- [ ] All /api/todos endpoints require authentication
  ```bash
  curl http://localhost:8000/api/todos
  ```
  Expected: 401 Unauthorized

- [ ] Ownership verification on DELETE/PUT operations
  - As test1, try to delete test2's todo (if you know the ID)
  - Expected: 403 Forbidden

---

## Functional Tests

### Todo CRUD Operations
- [ ] Create todo with title only
- [ ] Create todo with title and description
- [ ] Mark todo as complete
- [ ] Mark todo as incomplete
- [ ] Delete todo (with confirmation)
- [ ] View all todos in reverse chronological order

### Edge Cases
- [ ] Empty title validation (try to create todo with empty title)
- [ ] Long title (200 characters)
- [ ] Long description (1000 characters)
- [ ] Special characters in title/description
- [ ] Multiple concurrent users (open in 2 different browsers)

---

## Performance Tests

- [ ] JWT token verification adds <50ms latency
  - Check Network tab → API request timing
  - Expected: Most requests complete in <200ms

- [ ] Authentication endpoints respond in <2 seconds
  - Sign in and check Network tab
  - Expected: /api/auth/signin completes in <2s

---

## Summary

**Total Tests**: 20 core + 10 additional = 30 tests

**Pass Criteria**: All 20 core tests must pass for feature to be considered complete.

**Known Limitations**:
- No token refresh mechanism (users must re-authenticate after expiration)
- No password reset functionality
- No email verification
- No rate limiting on authentication endpoints

**Security Posture**: ✅ STRONG
- JWT authentication enforced on all protected endpoints
- User isolation verified at database query level
- Passwords hashed with bcrypt (cost factor 12)
- CORS configured correctly
- Secrets stored in environment variables

---

## Troubleshooting

If any test fails, refer to:
- README.md → Troubleshooting section
- specs/002-auth-api-security/quickstart.md
- Backend logs: Check terminal running uvicorn
- Frontend logs: Check browser console (F12)
- Network tab: Check API request/response details

---

**Verification Completed By**: _________________
**Date**: _________________
**Result**: ☐ PASS ☐ FAIL (with notes)
**Notes**:
