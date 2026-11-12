from sqlalchemy.orm import Session
from app.core.security import verify_password, get_password_hash
from app.core.exceptions import EntityNotFoundException, ValidationException
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.repositories.history_repo import LearningHistoryRepository
from app.schemas.user import UserUpdate


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.history_repo = LearningHistoryRepository(db)

    def update_profile(self, user_id: int, payload: UserUpdate) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise EntityNotFoundException("User", user_id)

        if payload.full_name is not None:
            user.full_name = payload.full_name.strip()
        if payload.preferred_language is not None:
            user.preferred_language = payload.preferred_language
        if payload.preferred_difficulty is not None:
            user.preferred_difficulty = payload.preferred_difficulty

        if payload.new_password:
            if not payload.current_password:
                raise ValidationException("Current password is required to set a new password.")
            if not verify_password(payload.current_password, user.password_hash):
                raise ValidationException("Current password provided is incorrect.")
            user.password_hash = get_password_hash(payload.new_password)

        updated = self.user_repo.update(user)
        self.history_repo.log(
            user_id=user_id,
            activity_type="profile_updated",
            description="Updated student profile settings.",
        )
        return updated
