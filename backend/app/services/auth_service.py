from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import ConflictException, AuthenticationFailedException, EntityNotFoundException
from app.core.logging_config import logger
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.repositories.history_repo import LearningHistoryRepository
from app.schemas.auth import UserRegister, UserLogin


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.history_repo = LearningHistoryRepository(db)

    def register(self, payload: UserRegister) -> Dict[str, Any]:
        """Register a new student account and issue JWT."""
        existing = self.user_repo.get_by_email(payload.email)
        if existing:
            raise ConflictException(f"An account with email '{payload.email}' already exists.")

        user = User(
            full_name=payload.full_name.strip(),
            email=payload.email.lower().strip(),
            password_hash=get_password_hash(payload.password),
            role="student",
            preferred_language=payload.preferred_language or "Python",
            preferred_difficulty=payload.preferred_difficulty or "Beginner",
        )
        created_user = self.user_repo.create(user)

        # Log initial learning activity
        self.history_repo.log(
            user_id=created_user.id,
            activity_type="account_created",
            description=f"Welcome to ConceptBridge AI! Initialized profile with {created_user.preferred_language}.",
        )

        token = create_access_token(
            subject=created_user.email,
            user_id=created_user.id,
            role=created_user.role,
        )

        logger.info(f"Student registered successfully: id={created_user.id}")

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": created_user.id,
                "full_name": created_user.full_name,
                "email": created_user.email,
                "role": created_user.role,
                "preferred_language": created_user.preferred_language,
                "preferred_difficulty": created_user.preferred_difficulty,
            },
        }

    def login(self, payload: UserLogin) -> Dict[str, Any]:
        """Authenticate user by email and password and issue JWT."""
        user = self.user_repo.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.password_hash):
            raise AuthenticationFailedException("Invalid email or password combination.")

        token = create_access_token(
            subject=user.email,
            user_id=user.id,
            role=user.role,
        )

        logger.info(f"Student login successful: id={user.id}")

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "preferred_language": user.preferred_language,
                "preferred_difficulty": user.preferred_difficulty,
            },
        }

    def get_user_profile(self, user_id: int) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise EntityNotFoundException("User", user_id)
        return user
