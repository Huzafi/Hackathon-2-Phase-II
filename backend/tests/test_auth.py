"""Tests for authentication endpoints."""
import pytest
from fastapi.testclient import TestClient


def test_signup_success(client: TestClient):
    """Test successful user signup."""
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "newuser@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "user" in data
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["token_type"] == "bearer"


def test_signup_duplicate_email(client: TestClient):
    """Test signup with duplicate email fails."""
    # First signup
    client.post(
        "/api/auth/signup",
        json={
            "email": "duplicate@example.com",
            "password": "password123"
        }
    )

    # Second signup with same email
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "duplicate@example.com",
            "password": "password456"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_signup_invalid_email(client: TestClient):
    """Test signup with invalid email format."""
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "not-an-email",
            "password": "password123"
        }
    )
    assert response.status_code == 422


def test_signup_short_password(client: TestClient):
    """Test signup with password less than 8 characters."""
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "user@example.com",
            "password": "short"
        }
    )
    assert response.status_code == 422


def test_signin_success(client: TestClient):
    """Test successful user signin."""
    # First signup
    client.post(
        "/api/auth/signup",
        json={
            "email": "signin@example.com",
            "password": "password123"
        }
    )

    # Then signin
    response = client.post(
        "/api/auth/signin",
        json={
            "email": "signin@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "access_token" in data
    assert data["user"]["email"] == "signin@example.com"


def test_signin_wrong_password(client: TestClient):
    """Test signin with incorrect password."""
    # First signup
    client.post(
        "/api/auth/signup",
        json={
            "email": "wrongpass@example.com",
            "password": "correctpassword"
        }
    )

    # Signin with wrong password
    response = client.post(
        "/api/auth/signin",
        json={
            "email": "wrongpass@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


def test_signin_nonexistent_user(client: TestClient):
    """Test signin with non-existent email."""
    response = client.post(
        "/api/auth/signin",
        json={
            "email": "nonexistent@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 401


def test_get_me_success(client: TestClient, auth_headers: dict):
    """Test getting current user information."""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "email" in data
    assert "created_at" in data
    assert "hashed_password" not in data  # Should not expose password


def test_get_me_no_token(client: TestClient):
    """Test getting current user without authentication."""
    response = client.get("/api/auth/me")
    assert response.status_code == 403  # No credentials provided


def test_get_me_invalid_token(client: TestClient):
    """Test getting current user with invalid token."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-token"}
    )
    assert response.status_code == 401
