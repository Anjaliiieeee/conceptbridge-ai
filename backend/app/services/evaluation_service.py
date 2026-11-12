import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException, AuthorizationFailedException
from app.core.logging_config import logger
from app.models.submission import Submission
from app.models.evaluation import Evaluation
from app.repositories.submission_repo import SubmissionRepository
from app.repositories.evaluation_repo import EvaluationRepository
from app.repositories.challenge_repo import ChallengeRepository
from app.repositories.mastery_repo import ConceptMasteryRepository
from app.repositories.history_repo import LearningHistoryRepository
from app.services.ai_service import ai_service


class EvaluationService:
    def __init__(self, db: Session):
        self.db = db
        self.submission_repo = SubmissionRepository(db)
        self.evaluation_repo = EvaluationRepository(db)
        self.challenge_repo = ChallengeRepository(db)
        self.mastery_repo = ConceptMasteryRepository(db)
        self.history_repo = LearningHistoryRepository(db)

    def submit_and_evaluate(self, user_id: int, challenge_id: int, submitted_answer: str) -> Evaluation:
        """Record submission, evaluate using AI, update concept mastery and learning history."""
        challenge = self.challenge_repo.get_detail_by_id(challenge_id)
        if not challenge:
            raise EntityNotFoundException("Challenge", challenge_id)

        # 1. Record Submission
        submission = Submission(
            user_id=user_id,
            challenge_id=challenge_id,
            submitted_answer=submitted_answer,
        )
        saved_submission = self.submission_repo.create(submission)

        # 2. Invoke AI Evaluation
        challenge_dict = {
            "title": challenge.title,
            "description": challenge.description,
            "requirements": challenge.requirements,
            "expected_solution": challenge.expected_solution,
            "evaluation_criteria": challenge.evaluation_criteria,
            "difficulty": challenge.difficulty,
        }
        concept_name = challenge.concept.concept_name if challenge.concept else "Programming Fundamentals"

        ai_eval = ai_service.evaluate_answer(
            challenge=challenge_dict,
            student_answer=submitted_answer,
            concept_name=concept_name,
        )

        # 3. Serialize mistakes list to JSON string for database storage
        mistakes_json = json.dumps(ai_eval.mistakes) if isinstance(ai_eval.mistakes, list) else str(ai_eval.mistakes)

        # 4. Save Evaluation Record
        evaluation = Evaluation(
            submission_id=saved_submission.id,
            score=ai_eval.score,
            is_correct=ai_eval.is_correct,
            explanation=ai_eval.explanation,
            mistakes=mistakes_json,
            conceptual_gap=ai_eval.conceptual_gap,
            suggested_improvement=ai_eval.suggested_improvement,
            correct_approach=ai_eval.correct_approach,
            recommended_challenge=ai_eval.recommended_challenge,
        )
        saved_eval = self.evaluation_repo.create(evaluation)

        # 5. Update Concept Mastery for this user
        self.mastery_repo.upsert_mastery(
            user_id=user_id,
            concept_id=challenge.concept_id,
            score=ai_eval.score,
            is_correct=ai_eval.is_correct,
        )

        # 6. Log activity in Learning History
        status_label = "Mastered" if ai_eval.is_correct else "Needs Practice"
        self.history_repo.log(
            user_id=user_id,
            activity_type="challenge_evaluated",
            description=f"Completed '{challenge.title}' ({concept_name}) with score {ai_eval.score}/100 [{status_label}].",
            score=ai_eval.score,
        )

        logger.info(f"Evaluated submission id={saved_submission.id} for user={user_id}: score={ai_eval.score}")
        return saved_eval

    def get_evaluation(self, submission_id: int, user_id: int) -> Evaluation:
        """Fetch evaluation ensuring user data isolation."""
        evaluation = self.evaluation_repo.get_by_submission_id(submission_id)
        if not evaluation:
            raise EntityNotFoundException("Evaluation", submission_id)

        # Strict user isolation check
        if evaluation.submission.user_id != user_id:
            raise AuthorizationFailedException("You are not authorized to view this evaluation.")

        return evaluation
