"""Authentication dependency for FastAPI routes."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from ..core.security import verify_jwt_token
from ..core.database import get_session
from ..models.user import User


# HTTP Bearer security scheme
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """
    Extract and verify JWT token, return authenticated user.

    This dependency is used to protect routes that require authentication.
    It extracts the JWT token from the Authorization header, verifies it,
    and returns the authenticated user from the database.

    Args:
        credentials: HTTP Bearer credentials from request header
        session: Database session

    Returns:
        Authenticated User object

    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    token = credentials.credentials
    payload = verify_jwt_token(token)

    # Extract user ID from token payload (Better Auth uses 'sub')
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    # Fetch user from database
    user = session.get(User, int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
