"""Tests for todo endpoints."""
import pytest
from fastapi.testclient import TestClient


def test_create_todo_success(client: TestClient, auth_headers: dict):
    """Test creating a new todo."""
    response = client.post(
        "/api/todos",
        json={
            "title": "Test Todo",
            "description": "Test description"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert data["description"] == "Test description"
    assert data["is_completed"] is False
    assert "id" in data
    assert "user_id" in data


def test_create_todo_no_auth(client: TestClient):
    """Test creating todo without authentication."""
    response = client.post(
        "/api/todos",
        json={"title": "Test Todo"}
    )
    assert response.status_code == 403


def test_create_todo_empty_title(client: TestClient, auth_headers: dict):
    """Test creating todo with empty title."""
    response = client.post(
        "/api/todos",
        json={"title": "   "},
        headers=auth_headers
    )
    assert response.status_code == 400


def test_list_todos_empty(client: TestClient, auth_headers: dict):
    """Test listing todos when none exist."""
    response = client.get("/api/todos", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_list_todos_with_data(client: TestClient, auth_headers: dict):
    """Test listing todos after creating some."""
    # Create multiple todos
    client.post(
        "/api/todos",
        json={"title": "Todo 1"},
        headers=auth_headers
    )
    client.post(
        "/api/todos",
        json={"title": "Todo 2"},
        headers=auth_headers
    )

    # List todos
    response = client.get("/api/todos", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Should be in reverse chronological order
    assert data[0]["title"] == "Todo 2"
    assert data[1]["title"] == "Todo 1"


def test_list_todos_user_isolation(client: TestClient):
    """Test that users only see their own todos."""
    # Create first user and todo
    response1 = client.post(
        "/api/auth/signup",
        json={"email": "user1@example.com", "password": "password123"}
    )
    token1 = response1.json()["access_token"]
    client.post(
        "/api/todos",
        json={"title": "User 1 Todo"},
        headers={"Authorization": f"Bearer {token1}"}
    )

    # Create second user and todo
    response2 = client.post(
        "/api/auth/signup",
        json={"email": "user2@example.com", "password": "password123"}
    )
    token2 = response2.json()["access_token"]
    client.post(
        "/api/todos",
        json={"title": "User 2 Todo"},
        headers={"Authorization": f"Bearer {token2}"}
    )

    # User 1 should only see their todo
    response = client.get(
        "/api/todos",
        headers={"Authorization": f"Bearer {token1}"}
    )
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "User 1 Todo"


def test_get_todo_success(client: TestClient, auth_headers: dict):
    """Test getting a specific todo."""
    # Create todo
    create_response = client.post(
        "/api/todos",
        json={"title": "Test Todo"},
        headers=auth_headers
    )
    todo_id = create_response.json()["id"]

    # Get todo
    response = client.get(f"/api/todos/{todo_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Test Todo"


def test_get_todo_not_found(client: TestClient, auth_headers: dict):
    """Test getting non-existent todo."""
    response = client.get("/api/todos/99999", headers=auth_headers)
    assert response.status_code == 404


def test_patch_todo_toggle_completion(client: TestClient, auth_headers: dict):
    """Test toggling todo completion status."""
    # Create todo
    create_response = client.post(
        "/api/todos",
        json={"title": "Test Todo"},
        headers=auth_headers
    )
    todo_id = create_response.json()["id"]

    # Mark as completed
    response = client.patch(
        f"/api/todos/{todo_id}",
        json={"is_completed": True},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["is_completed"] is True

    # Mark as incomplete
    response = client.patch(
        f"/api/todos/{todo_id}",
        json={"is_completed": False},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["is_completed"] is False


def test_put_todo_success(client: TestClient, auth_headers: dict):
    """Test full update of todo."""
    # Create todo
    create_response = client.post(
        "/api/todos",
        json={"title": "Original Title"},
        headers=auth_headers
    )
    todo_id = create_response.json()["id"]

    # Update todo
    response = client.put(
        f"/api/todos/{todo_id}",
        json={
            "title": "Updated Title",
            "description": "Updated description",
            "is_completed": True
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["description"] == "Updated description"
    assert data["is_completed"] is True


def test_delete_todo_success(client: TestClient, auth_headers: dict):
    """Test deleting a todo."""
    # Create todo
    create_response = client.post(
        "/api/todos",
        json={"title": "To Delete"},
        headers=auth_headers
    )
    todo_id = create_response.json()["id"]

    # Delete todo
    response = client.delete(f"/api/todos/{todo_id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify it's deleted
    response = client.get(f"/api/todos/{todo_id}", headers=auth_headers)
    assert response.status_code == 404


def test_delete_todo_forbidden(client: TestClient):
    """Test that users cannot delete other users' todos."""
    # Create first user and todo
    response1 = client.post(
        "/api/auth/signup",
        json={"email": "owner@example.com", "password": "password123"}
    )
    token1 = response1.json()["access_token"]
    create_response = client.post(
        "/api/todos",
        json={"title": "Owner's Todo"},
        headers={"Authorization": f"Bearer {token1}"}
    )
    todo_id = create_response.json()["id"]

    # Create second user
    response2 = client.post(
        "/api/auth/signup",
        json={"email": "other@example.com", "password": "password123"}
    )
    token2 = response2.json()["access_token"]

    # Try to delete with second user
    response = client.delete(
        f"/api/todos/{todo_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert response.status_code == 403
