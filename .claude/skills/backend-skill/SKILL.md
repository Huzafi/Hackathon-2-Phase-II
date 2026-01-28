---
name: backend-skill
description: Generate backend routes, handle requests and responses, and connect application logic to databases. Use for API and server-side development.
---

# Backend Development Skill

## Instructions

1. **Routing**
   - Define clear and RESTful routes
   - Group routes by feature or resource
   - Use appropriate HTTP methods

2. **Request & response handling**
   - Validate incoming request data
   - Return consistent response structures
   - Handle errors gracefully with proper status codes

3. **Database integration**
   - Connect to database using defined models
   - Perform CRUD operations safely
   - Keep DB logic separated from route handlers

## Best Practices
- Single responsibility per route handler
- Validate inputs before processing
- Avoid business logic inside controllers
- Use clear naming and consistent patterns
- Write code that is easy to extend and test

## Example Structure
```python
@router.post("/items")
def create_item(payload: ItemCreate):
    item = service.create_item(payload)
    return {"success": True, "data": item}
