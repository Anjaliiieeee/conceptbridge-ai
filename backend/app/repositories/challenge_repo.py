from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.models.challenge import Challenge
from app.repositories.base_repo import BaseRepository


class ChallengeRepository(BaseRepository[Challenge]):
    def __init__(self, db: Session):
        super().__init__(Challenge, db)

    def get_by_filters(
        self,
        subject_id: Optional[int] = None,
        concept_id: Optional[int] = None,
        difficulty: Optional[str] = None,
        limit: int = 20,
    ) -> List[Challenge]:
        stmt = select(Challenge).options(
            joinedload(Challenge.subject),
            joinedload(Challenge.concept),
        )
        if subject_id:
            stmt = stmt.where(Challenge.subject_id == subject_id)
        if concept_id:
            stmt = stmt.where(Challenge.concept_id == concept_id)
        if difficulty:
            stmt = stmt.where(Challenge.difficulty.ilike(difficulty))

        stmt = stmt.order_by(Challenge.created_at.desc()).limit(limit)
        return list(self.db.scalars(stmt).unique().all())

    def get_detail_by_id(self, challenge_id: int) -> Optional[Challenge]:
        stmt = (
            select(Challenge)
            .options(
                joinedload(Challenge.subject),
                joinedload(Challenge.concept),
            )
            .where(Challenge.id == challenge_id)
        )
        return self.db.scalars(stmt).first()
