---
name: auth-skill
description: Implement secure authentication flows including signup, signin, password hashing, JWT handling, and Better Auth integration.
---

# Auth Skill

## Instructions

1. **User flows**
   - Signup with validated input
   - Signin with secure credential verification
   - Clear error responses for auth failures

2. **Password security**
   - Hash passwords using strong, modern algorithms
   - Never store or log plain-text passwords
   - Verify hashes safely on signin

3. **Token handling**
   - Issue JWT tokens on successful authentication
   - Validate token signature and expiration
   - Support refresh or rotation where applicable

4. **Better Auth integration**
   - Follow Better Auth recommended patterns
   - Use secure defaults and configuration
   - Avoid custom auth logic when Better Auth provides it

## Best Practices
- Always validate input before processing
- Fail securely with minimal error leakage
- Use environment variables for secrets
- Keep auth logic isolated from business logic

## Example Flow (Pseudo)
```text
User signup → validate input → hash password → store user
User signin → validate input → verify password → issue JWT
Authenticated request → verify JWT → allow access
