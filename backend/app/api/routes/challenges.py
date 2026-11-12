from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.challenge import ChallengeGenerateRequest, ChallengeRead, ChallengeDetail
from app.schemas.submission import SubmissionCreate
from app.schemas.evaluation import EvaluationRead
from app.models.user import User
from app.services.challenge_service import ChallengeService
from app.services.evaluation_service import EvaluationService
from app.api.dependencies import (
    get_challenge_service,
    get_evaluation_service,
    get_current_user,
)

router = APIRouter(prefix="/challenges", tags=["Challenges"])


@router.post("/generate", response_model=ChallengeRead, status_code=status.HTTP_201_CREATED)
def generate_challenge(
    request: ChallengeGenerateRequest,
    current_user: User = Depends(get_current_user),
    challenge_service: ChallengeService = Depends(get_challenge_service),
):
    """Generate a practical, scenario-based programming challenge using AI or smart rule engine."""
    challenge = challenge_service.generate_challenge(request, user_id=current_user.id)
    return ChallengeRead(
        id=challenge.id,
        subject_id=challenge.subject_id,
        concept_id=challenge.concept_id,
        subject_name=challenge.subject.subject_name if challenge.subject else None,
        concept_name=challenge.concept.concept_name if challenge.concept else None,
        title=challenge.title,
        description=challenge.description,
        difficulty=challenge.difficulty,
        real_world_scenario=challenge.real_world_scenario,
        requirements=challenge.requirements,
        examples=challenge.examples,
        is_ai_generated=challenge.is_ai_generated,
        created_at=challenge.created_at,
    )


@router.get("", response_model=List[ChallengeRead])
def get_challenges(
    subject_id: Optional[int] = Query(None, description="Filter by subject"),
    concept_id: Optional[int] = Query(None, description="Filter by concept"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    challenge_service: ChallengeService = Depends(get_challenge_service),
):
    """List challenges with optional filtering by subject, concept, or difficulty."""
    challenges = challenge_service.list_challenges(
        subject_id=subject_id,
        concept_id=concept_id,
        difficulty=difficulty,
        limit=limit,
    )
    return [
        ChallengeRead(
            id=c.id,
            subject_id=c.subject_id,
            concept_id=c.concept_id,
            subject_name=c.subject.subject_name if c.subject else None,
            concept_name=c.concept.concept_name if c.concept else None,
            title=c.title,
            description=c.description,
            difficulty=c.difficulty,
            real_world_scenario=c.real_world_scenario,
            requirements=c.requirements,
            examples=c.examples,
            is_ai_generated=c.is_ai_generated,
            created_at=c.created_at,
        )
        for c in challenges
    ]


@router.get("/{challenge_id}", response_model=ChallengeDetail)
def get_challenge_detail(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    challenge_service: ChallengeService = Depends(get_challenge_service),
):
    """Retrieve full details of a specific challenge."""
    challenge = challenge_service.get_challenge(challenge_id)
    return ChallengeDetail(
        id=challenge.id,
        subject_id=challenge.subject_id,
        concept_id=challenge.concept_id,
        subject_name=challenge.subject.subject_name if challenge.subject else None,
        concept_name=challenge.concept.concept_name if challenge.concept else None,
        title=challenge.title,
        description=challenge.description,
        difficulty=challenge.difficulty,
        real_world_scenario=challenge.real_world_scenario,
        requirements=challenge.requirements,
        examples=challenge.examples,
        expected_solution=challenge.expected_solution,
        evaluation_criteria=challenge.evaluation_criteria,
        is_ai_generated=challenge.is_ai_generated,
        created_at=challenge.created_at,
    )


@router.post("/{challenge_id}/submit", response_model=EvaluationRead, status_code=status.HTTP_201_CREATED)
def submit_challenge_answer(
    challenge_id: int,
    payload: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    evaluation_service: EvaluationService = Depends(get_evaluation_service),
):
    """Submit student's technical solution, execute AI evaluation, and update mastery progress."""
    evaluation = evaluation_service.submit_and_evaluate(
        user_id=current_user.id,
        challenge_id=challenge_id,
        submitted_answer=payload.submitted_answer,
    )
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
