from fastapi import APIRouter, Depends
from app.schemas.evaluation import EvaluationRead
from app.models.user import User
from app.services.evaluation_service import EvaluationService
from app.api.dependencies import get_evaluation_service, get_current_user

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])


@router.get("/{submission_id}", response_model=EvaluationRead)
def get_evaluation(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    evaluation_service: EvaluationService = Depends(get_evaluation_service),
):
    """Retrieve detailed AI evaluation for a specific submission, with user isolation."""
    evaluation = evaluation_service.get_evaluation(submission_id, user_id=current_user.id)
    challenge = evaluation.submission.challenge
    return EvaluationRead(
        id=evaluation.id,
        submission_id=evaluation.submission_id,
        score=evaluation.score,
        is_correct=evaluation.is_correct,
        explanation=evaluation.explanation,
        mistakes=evaluation.mistakes,
        conceptual_gap=evaluation.conceptual_gap,
        suggested_improvement=evaluation.suggested_improvement,
        correct_approach=evaluation.correct_approach,
        recommended_challenge=evaluation.recommended_challenge,
        created_at=evaluation.created_at,
        challenge_id=challenge.id if challenge else None,
        challenge_title=challenge.title if challenge else None,
        concept_name=challenge.concept.concept_name if challenge and challenge.concept else None,
        subject_name=challenge.subject.subject_name if challenge and challenge.subject else None,
        submitted_answer=evaluation.submission.submitted_answer if evaluation.submission else None,
    )
