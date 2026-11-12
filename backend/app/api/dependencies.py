from typing import Generator
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationFailedException, EntityNotFoundException
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.services.auth_service import AuthService
from app.services.challenge_service import ChallengeService
from app.services.evaluation_service import EvaluationService
from app.services.progress_service import ProgressService
from app.services.user_service import UserService


def get_token_from_header(authorization: str = Header(None)) -> str:
    """Extract Bearer token from standard Authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme. Expected 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return parts[1]


def get_current_user(
    token: str = Depends(get_token_from_header),
    db: Session = Depends(get_db),
) -> User:
    """Validate JWT access token and return active User instance."""
    try:
        payload = decode_access_token(token)
    except AuthenticationFailedException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token does not exist.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# Service Dependencies (Inversion of Control)
def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)


def get_challenge_service(db: Session = Depends(get_db)) -> ChallengeService:
    return ChallengeService(db)


def get_evaluation_service(db: Session = Depends(get_db)) -> EvaluationService:
    return EvaluationService(db)


def get_progress_service(db: Session = Depends(get_db)) -> ProgressService:
    return ProgressService(db)


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)
