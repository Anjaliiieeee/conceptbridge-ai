from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.history import LearningHistory
from app.repositories.base_repo import BaseRepository


class LearningHistoryRepository(BaseRepository[LearningHistory]):
    def __init__(self, db: Session):
        super().__init__(LearningHistory, db)

    def log(
        self,
        user_id: int,
        activity_type: str,
        description: str,
        score: Optional[int] = None,
    ) -> LearningHistory:
        history = LearningHistory(
            user_id=user_id,
            activity_type=activity_type,
            activity_description=description,
            score=score,
            created_at=datetime.now(timezone.utc),
        )
        return self.create(history)

    def get_by_user(self, user_id: int, limit: int = 30) -> List[LearningHistory]:
        stmt = (
            select(LearningHistory)
            .where(LearningHistory.user_id == user_id)
            .order_by(LearningHistory.created_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
