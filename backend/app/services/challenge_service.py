from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException, ValidationException
from app.core.logging_config import logger
from app.models.challenge import Challenge
from app.models.subject import Subject
from app.models.concept import Concept
from app.repositories.challenge_repo import ChallengeRepository
from app.repositories.subject_repo import SubjectRepository
from app.repositories.concept_repo import ConceptRepository
from app.repositories.mastery_repo import ConceptMasteryRepository
from app.repositories.history_repo import LearningHistoryRepository
from app.services.ai_service import ai_service
from app.schemas.challenge import ChallengeGenerateRequest


class ChallengeService:
    def __init__(self, db: Session):
        self.db = db
        self.challenge_repo = ChallengeRepository(db)
        self.subject_repo = SubjectRepository(db)
        self.concept_repo = ConceptRepository(db)
        self.mastery_repo = ConceptMasteryRepository(db)
        self.history_repo = LearningHistoryRepository(db)

    def get_challenge(self, challenge_id: int) -> Challenge:
        challenge = self.challenge_repo.get_detail_by_id(challenge_id)
        if not challenge:
            raise EntityNotFoundException("Challenge", challenge_id)
        return challenge

    def list_challenges(
        self,
        subject_id: Optional[int] = None,
        concept_id: Optional[int] = None,
        difficulty: Optional[str] = None,
        limit: int = 20,
    ) -> List[Challenge]:
        return self.challenge_repo.get_by_filters(
            subject_id=subject_id,
            concept_id=concept_id,
            difficulty=difficulty,
            limit=limit,
        )

    def generate_challenge(self, request: ChallengeGenerateRequest, user_id: int) -> Challenge:
        """Resolve subject and concept, generate practical scenario via AI, and persist."""
        target_gap: Optional[str] = None

        # 1. Resolve Subject
        subject: Optional[Subject] = None
        if request.subject_id:
            subject = self.subject_repo.get_by_id(request.subject_id)
        elif request.subject_name:
            subject = self.subject_repo.get_by_name(request.subject_name)

        if not subject:
            # Fallback to Python if not specified
            subject = self.subject_repo.get_by_name("Python") or self.subject_repo.get_all()[0]

        # 2. Check for weak area focus if requested
        if request.focus_weak_areas:
            weak_masteries = self.mastery_repo.get_weak_concepts_for_user(user_id)
            if weak_masteries:
                target_mastery = weak_masteries[0]
                concept = target_mastery.concept
                target_gap = f"Strengthen practical proficiency in {concept.concept_name} (Current score: {target_mastery.mastery_score}%)"
            else:
                concept = None
        else:
            concept = None

        # 3. Resolve Concept if not assigned by weak area focus
        if not concept:
            if request.concept_id:
                concept = self.concept_repo.get_by_id(request.concept_id)
            elif request.concept_name:
                concept = self.concept_repo.get_by_subject_and_name(subject.id, request.concept_name)
                if not concept:
                    concept = self.concept_repo.get_by_name_global(request.concept_name)

        if not concept:
            # Fallback to first concept of the subject
            concepts = self.concept_repo.get_by_subject_id(subject.id)
            concept = concepts[0] if concepts else None

        if not concept:
            raise ValidationException(f"No concept available for subject '{subject.subject_name}'")

        difficulty = request.difficulty or concept.difficulty_level or "Beginner"

        # 4. Invoke AI Service
        ai_output = ai_service.generate_challenge(
            subject_name=subject.subject_name,
            concept_name=concept.concept_name,
            difficulty=difficulty,
            target_gap=target_gap,
        )

        # 5. Persist the generated challenge
        challenge = Challenge(
            subject_id=subject.id,
            concept_id=concept.id,
            title=ai_output.title,
            description=ai_output.description,
            difficulty=difficulty,
            real_world_scenario=ai_output.real_world_scenario,
            requirements=ai_output.requirements,
            examples=ai_output.examples,
            expected_solution=ai_output.expected_solution,
            evaluation_criteria=ai_output.evaluation_criteria,
            is_ai_generated=True,
        )
        saved = self.challenge_repo.create(challenge)

        # 6. Log history
        self.history_repo.log(
            user_id=user_id,
            activity_type="challenge_generated",
            description=f"Generated {difficulty} challenge on {concept.concept_name} ({subject.subject_name}): '{saved.title}'.",
        )

        logger.info(f"Generated challenge id={saved.id} for user={user_id}")
        return self.challenge_repo.get_detail_by_id(saved.id) or saved
