from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserRead, UserUpdate, UserProfile
from app.models.user import User
from app.services.user_service import UserService
from app.services.progress_service import ProgressService
from app.api.dependencies import get_user_service, get_progress_service, get_current_user

router = APIRouter(prefix="/profile", tags=["Profile & Settings"])


@router.get("", response_model=UserProfile)
def get_profile(
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service),
):
    """Retrieve student profile enriched with core learning statistics."""
    summary = progress_service.get_summary(current_user.id)
    return UserProfile(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        role=current_user.role,
        preferred_language=current_user.preferred_language,
        preferred_difficulty=current_user.preferred_difficulty,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        total_submissions=summary.total_challenges_completed,
        average_score=summary.average_score,
        concepts_mastered=summary.concepts_mastered,
        current_streak=summary.learning_streak,
    )


@router.put("", response_model=UserRead)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Update profile details, preferences, or password."""
    updated_user = user_service.update_profile(current_user.id, payload)
    return updated_user
