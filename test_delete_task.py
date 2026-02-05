"""Test script for delete_task MCP tool implementation.

This script validates the delete_task functionality including:
- Successful deletion of owned tasks
- Permission denied for non-existent tasks
- User authentication validation
- Database error handling
"""
import json
from unittest.mock import Mock, MagicMock
from datetime import datetime

# Mock the imports before importing the tools module
import sys
sys.path.insert(0, 'backend/src')

from agent.tools import delete_task


def test_delete_task_success():
    """Test successful task deletion."""
    print("\n=== Test 1: Successful Task Deletion ===")

    # Mock database session and task
    mock_session = Mock()
    mock_task = Mock()
    mock_task.id = 123
    mock_task.title = "Buy groceries"
    mock_task.user_id = 1

    # Mock query result
    mock_query_result = Mock()
    mock_query_result.first.return_value = mock_task
    mock_session.exec.return_value = mock_query_result

    # Context with user_id and session
    context = {
        "user_id": 1,
        "session": mock_session,
    }

    # Call delete_task
    result_json = delete_task(context, task_id=123)
    result = json.loads(result_json)

    # Assertions
    assert result["success"] is True, "Expected success=True"
    assert result["message"] == "Task deleted successfully", f"Unexpected message: {result['message']}"
    assert result["data"]["task_id"] == 123, "Task ID mismatch"
    assert result["data"]["title"] == "Buy groceries", "Task title mismatch"

    # Verify delete was called
    mock_session.delete.assert_called_once_with(mock_task)
    mock_session.commit.assert_called_once()

    print("✓ Task deleted successfully")
    print(f"✓ Response: {json.dumps(result, indent=2)}")


def test_delete_task_not_found():
    """Test deletion of non-existent task."""
    print("\n=== Test 2: Task Not Found ===")

    # Mock database session with no task found
    mock_session = Mock()
    mock_query_result = Mock()
    mock_query_result.first.return_value = None  # Task not found
    mock_session.exec.return_value = mock_query_result

    context = {
        "user_id": 1,
        "session": mock_session,
    }

    # Call delete_task
    result_json = delete_task(context, task_id=999)
    result = json.loads(result_json)

    # Assertions
    assert result["success"] is False, "Expected success=False"
    assert result["error"] == "TASK_NOT_FOUND", f"Expected TASK_NOT_FOUND error, got: {result.get('error')}"
    assert "permission" in result["message"].lower(), "Expected permission message"

    # Verify delete was NOT called
    mock_session.delete.assert_not_called()

    print("✓ Task not found error returned correctly")
    print(f"✓ Response: {json.dumps(result, indent=2)}")


def test_delete_task_wrong_user():
    """Test deletion of another user's task."""
    print("\n=== Test 3: Permission Denied (Wrong User) ===")

    # Mock database session with task belonging to different user
    mock_session = Mock()
    mock_query_result = Mock()
    mock_query_result.first.return_value = None  # Query filters by user_id, so returns None
    mock_session.exec.return_value = mock_query_result

    context = {
        "user_id": 1,  # User 1 trying to delete
        "session": mock_session,
    }

    # Call delete_task (task belongs to user 2)
    result_json = delete_task(context, task_id=123)
    result = json.loads(result_json)

    # Assertions
    assert result["success"] is False, "Expected success=False"
    assert result["error"] == "TASK_NOT_FOUND", "Expected TASK_NOT_FOUND error"

    print("✓ Permission denied for other user's task")
    print(f"✓ Response: {json.dumps(result, indent=2)}")


def test_delete_task_no_auth():
    """Test deletion without authentication."""
    print("\n=== Test 4: User Not Authenticated ===")

    # Context without user_id
    context = {
        "session": Mock(),
    }

    # Call delete_task
    result_json = delete_task(context, task_id=123)
    result = json.loads(result_json)

    # Assertions
    assert result["success"] is False, "Expected success=False"
    assert result["error"] == "USER_NOT_AUTHENTICATED", f"Expected USER_NOT_AUTHENTICATED, got: {result.get('error')}"

    print("✓ Authentication error returned correctly")
    print(f"✓ Response: {json.dumps(result, indent=2)}")


def test_delete_task_no_session():
    """Test deletion without database session."""
    print("\n=== Test 5: Database Session Not Available ===")

    # Context without session
    context = {
        "user_id": 1,
    }

    # Call delete_task
    result_json = delete_task(context, task_id=123)
    result = json.loads(result_json)

    # Assertions
    assert result["success"] is False, "Expected success=False"
    assert result["error"] == "DATABASE_ERROR", f"Expected DATABASE_ERROR, got: {result.get('error')}"

    print("✓ Database session error returned correctly")
    print(f"✓ Response: {json.dumps(result, indent=2)}")


def test_delete_task_database_error():
    """Test deletion with database error."""
    print("\n=== Test 6: Database Error During Deletion ===")

    # Mock database session that raises exception
    mock_session = Mock()
    mock_task = Mock()
    mock_task.id = 123
    mock_task.title = "Test task"

    mock_query_result = Mock()
    mock_query_result.first.return_value = mock_task
    mock_session.exec.return_value = mock_query_result

    # Make delete raise an exception
    mock_session.delete.side_effect = Exception("Database connection lost")

    context = {
        "user_id": 1,
        "session": mock_session,
    }

    # Call delete_task
    result_json = delete_task(context, task_id=123)
    result = json.loads(result_json)

    # Assertions
    assert result["success"] is False, "Expected success=False"
    assert result["error"] == "DATABASE_ERROR", f"Expected DATABASE_ERROR, got: {result.get('error')}"

    # Verify rollback was called
    mock_session.rollback.assert_called_once()

    print("✓ Database error handled with rollback")
    print(f"✓ Response: {json.dumps(result, indent=2)}")


def run_all_tests():
    """Run all delete_task tests."""
    print("=" * 60)
    print("DELETE_TASK MCP TOOL TEST SUITE")
    print("=" * 60)

    try:
        test_delete_task_success()
        test_delete_task_not_found()
        test_delete_task_wrong_user()
        test_delete_task_no_auth()
        test_delete_task_no_session()
        test_delete_task_database_error()

        print("\n" + "=" * 60)
        print("✓ ALL TESTS PASSED")
        print("=" * 60)
        return True
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {str(e)}")
        return False
    except Exception as e:
        print(f"\n✗ UNEXPECTED ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
