# Delete Task Integration Test Guide

## Overview
This guide provides manual integration tests for the delete_task MCP tool implementation.

## Prerequisites
1. Backend server running on `http://localhost:8000`
2. Valid JWT token from authenticated user
3. curl or similar HTTP client

## Test Setup

### 1. Get JWT Token
```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'

# Login to get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Save the token from response
export JWT_TOKEN="<your_jwt_token_here>"
```

## Test Cases

### Test 1: Create and Delete Task by ID

**Step 1: Create a task**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a task to buy groceries"
  }'
```

**Expected Response:**
```json
{
  "conversation_id": "...",
  "message": "I've created a task for you: 'Buy groceries'...",
  "tool_calls": [
    {
      "name": "create_task",
      "result": {
        "success": true,
        "data": {
          "task_id": 1,
          "title": "Buy groceries"
        }
      }
    }
  ]
}
```

**Step 2: Delete task by ID**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete task 1"
  }'
```

**Expected Response:**
```json
{
  "conversation_id": "...",
  "message": "I've deleted 'Buy groceries' from your list.",
  "tool_calls": [
    {
      "name": "delete_task",
      "result": {
        "success": true,
        "message": "Task deleted successfully",
        "data": {
          "task_id": 1,
          "title": "Buy groceries"
        }
      }
    }
  ]
}
```

**Step 3: Verify deletion**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "List my tasks"
  }'
```

**Expected Response:**
```json
{
  "message": "You have no tasks in your list.",
  "tool_calls": [
    {
      "name": "list_tasks",
      "result": {
        "success": true,
        "message": "No tasks found",
        "data": {
          "tasks": [],
          "total": 0
        }
      }
    }
  ]
}
```

---

### Test 2: Delete Task by Title

**Step 1: Create multiple tasks**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create three tasks: buy milk, finish report, and call dentist"
  }'
```

**Step 2: Delete task by title**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete the milk task"
  }'
```

**Expected Behavior:**
- Agent lists tasks to find "milk" task
- Agent calls delete_task with correct task_id
- Agent confirms deletion with task title

---

### Test 3: Delete Non-Existent Task

**Test: Try to delete task that doesn't exist**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete task 99999"
  }'
```

**Expected Response:**
```json
{
  "message": "I couldn't find that task in your list. Would you like to see all your tasks?",
  "tool_calls": [
    {
      "name": "delete_task",
      "result": {
        "success": false,
        "message": "Task not found or you don't have permission",
        "error": "TASK_NOT_FOUND"
      }
    }
  ]
}
```

---

### Test 4: Delete with Ambiguous Reference

**Step 1: Create tasks with similar names**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create task: buy groceries at store A. Create task: buy groceries at store B"
  }'
```

**Step 2: Try to delete with ambiguous reference**
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete the groceries task"
  }'
```

**Expected Behavior:**
- Agent lists tasks and finds multiple matches
- Agent asks user to clarify which task to delete
- User provides specific task ID or more details

---

### Test 5: Natural Language Deletion Patterns

Test various natural language patterns:

```bash
# Pattern 1: "Delete [task]"
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Delete the report task"}'

# Pattern 2: "Remove [task]"
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Remove task 2"}'

# Pattern 3: "Get rid of [task]"
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Get rid of the dentist task"}'
```

---

## Security Tests

### Test 6: Cross-User Access Prevention

**Setup: Create two users**
```bash
# User 1 creates a task
export JWT_TOKEN_USER1="<user1_token>"
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN_USER1" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create task: User 1 private task"}'

# Note the task_id from response (e.g., task_id: 5)

# User 2 tries to delete User 1's task
export JWT_TOKEN_USER2="<user2_token>"
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $JWT_TOKEN_USER2" \
  -H "Content-Type: application/json" \
  -d '{"message": "Delete task 5"}'
```

**Expected Response:**
```json
{
  "message": "I couldn't find that task in your list...",
  "tool_calls": [
    {
      "name": "delete_task",
      "result": {
        "success": false,
        "message": "Task not found or you don't have permission",
        "error": "TASK_NOT_FOUND"
      }
    }
  ]
}
```

**Security Validation:**
- User 2 cannot delete User 1's task
- Error message doesn't reveal whether task exists
- Database query filters by user_id (security critical)

---

## Validation Checklist

After running all tests, verify:

- [ ] Tasks can be deleted by ID
- [ ] Tasks can be deleted by title reference
- [ ] Non-existent tasks return TASK_NOT_FOUND error
- [ ] Agent handles ambiguous references appropriately
- [ ] Natural language patterns work correctly
- [ ] Cross-user access is prevented
- [ ] Deleted tasks don't appear in list_tasks
- [ ] Tool invocations are logged to ToolInvocation table
- [ ] Database transactions rollback on errors
- [ ] Agent provides user-friendly error messages

---

## Database Verification

Check tool invocation logging:

```sql
-- Connect to Neon database
SELECT
  ti.id,
  ti.tool_name,
  ti.tool_arguments,
  ti.success,
  ti.error_message,
  ti.execution_time_ms,
  ti.created_at
FROM tool_invocations ti
WHERE ti.tool_name = 'delete_task'
ORDER BY ti.created_at DESC
LIMIT 10;
```

Expected columns:
- `tool_name`: "delete_task"
- `tool_arguments`: `{"task_id": 123}`
- `success`: true/false
- `error_message`: null or error code
- `execution_time_ms`: < 5000

---

## Troubleshooting

### Issue: "User not authenticated" error
**Solution:** Verify JWT token is valid and not expired

### Issue: "Task not found" for existing task
**Solution:** Verify task belongs to authenticated user

### Issue: Agent doesn't call delete_task
**Solution:** Check agent prompt includes deletion patterns

### Issue: Database error during deletion
**Solution:** Check database connection and transaction handling

---

## Performance Benchmarks

Expected performance:
- Tool execution: < 100ms
- Database query: < 50ms
- Total response time: < 2000ms

Monitor slow queries:
```sql
SELECT * FROM tool_invocations
WHERE tool_name = 'delete_task'
AND execution_time_ms > 1000;
```
