from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.models.mastery import ConceptMastery
from app.models.concept import Concept
from app.models.subject import Subject
from app.repositories.base_repo import BaseRepository


class ConceptMasteryRepository(BaseRepository[ConceptMastery]):
    def __init__(self, db: Session):
        super().__init__(ConceptMastery, db)

    def get_by_user_and_concept(self, user_id: int, concept_id: int) -> Optional[ConceptMastery]:
        stmt = (
            select(ConceptMastery)
            .options(
                joinedload(ConceptMastery.concept).joinedload(Concept.subject),
            )
            .where(
                ConceptMastery.user_id == user_id,
                ConceptMastery.concept_id == concept_id,
            )
        )
        return self.db.scalars(stmt).first()

    def get_all_by_user(self, user_id: int) -> List[ConceptMastery]:
        stmt = (
            select(ConceptMastery)
            .options(
                joinedload(ConceptMastery.concept).joinedload(Concept.subject),
            )
            .where(ConceptMastery.user_id == user_id)
            .order_by(ConceptMastery.mastery_score.desc())
        )
        return list(self.db.scalars(stmt).unique().all())

    def upsert_mastery(self, user_id: int, concept_id: int, score: int, is_correct: bool) -> ConceptMastery:
        mastery = self.get_by_user_and_concept(user_id, concept_id)
        now = datetime.now(timezone.utc)
        if not mastery:
            mastery = ConceptMastery(
                user_id=user_id,
                concept_id=concept_id,
                mastery_score=float(score),
                total_attempts=1,
                correct_attempts=1 if is_correct else 0,
                updated_at=now,
            )
            self.create(mastery)
        else:
            mastery.total_attempts += 1
            if is_correct:
                mastery.correct_attempts += 1
            # Weighted exponential moving average for smooth mastery calculation
            alpha = 0.35
            mastery.mastery_score = round((1 - alpha) * mastery.mastery_score + alpha * score, 1)
            mastery.updated_at = now
            self.update(mastery)
        return mastery

    def get_weak_concepts_for_user(self, user_id: int, threshold: float = 70.0) -> List[ConceptMastery]:
        stmt = (
            select(ConceptMastery)
            .options(joinedload(ConceptMastery.concept).joinedload(Concept.subject))
            .where(ConceptMastery.user_id == user_id, ConceptMastery.mastery_score < threshold)
            .order_by(ConceptMastery.mastery_score.asc())
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_strong_concepts_for_user(self, user_id: int, threshold: float = 75.0) -> List[ConceptMastery]:
        stmt = (
            select(ConceptMastery)
            .options(joinedload(ConceptMastery.concept).joinedload(Concept.subject))
            .where(ConceptMastery.user_id == user_id, ConceptMastery.mastery_score >= threshold)
            .order_by(ConceptMastery.mastery_score.desc())
        )
        return list(self.db.scalars(stmt).unique().all())
