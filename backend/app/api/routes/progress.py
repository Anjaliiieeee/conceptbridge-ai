from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.progress import (
    StudentProgressSummary,
    ConceptMasteryRead,
    LearningHistoryRead,
)
from app.models.user import User
from app.services.progress_service import ProgressService
from app.repositories.mastery_repo import ConceptMasteryRepository
from app.repositories.history_repo import LearningHistoryRepository
from app.api.dependencies import get_progress_service, get_current_user

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])


@router.get("", response_model=StudentProgressSummary)
def get_progress_summary(
    current_user: User = Depends(get_current_user),
    progress_service: ProgressService = Depends(get_progress_service),
):
    """Retrieve comprehensive learning analytics, streak, mastery scores, and recommendations."""
    return progress_service.get_summary(user_id=current_user.id)


@router.get("/concepts", response_model=List[ConceptMasteryRead])
def get_concept_mastery(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all concept mastery records for the authenticated student."""
    mastery_repo = ConceptMasteryRepository(db)
    masteries = mastery_repo.get_all_by_user(user_id=current_user.id)
    return [
        ConceptMasteryRead(
            id=m.id,
            concept_id=m.concept_id,
            concept_name=m.concept.concept_name if m.concept else f"Concept #{m.concept_id}",
            subject_name=m.concept.subject.subject_name if m.concept and m.concept.subject else "General",
            mastery_score=m.mastery_score,
            total_attempts=m.total_attempts,
            correct_attempts=m.correct_attempts,
            updated_at=m.updated_at,
        )
        for m in masteries
    ]


@router.get("/history", response_model=List[LearningHistoryRead])
def get_learning_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve learning activity history timeline for the student."""
    history_repo = LearningHistoryRepository(db)
    histories = history_repo.get_by_user(user_id=current_user.id, limit=50)
    return [
        LearningHistoryRead(
            id=h.id,
            activity_type=h.activity_type,
            activity_description=h.activity_description,
            score=h.score,
            created_at=h.created_at,
        )
        for h in histories
    ]
