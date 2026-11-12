from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.models.submission import Submission
from app.repositories.base_repo import BaseRepository


class SubmissionRepository(BaseRepository[Submission]):
    def __init__(self, db: Session):
        super().__init__(Submission, db)

    def get_user_submissions(self, user_id: int, limit: int = 50) -> List[Submission]:
        stmt = (
            select(Submission)
            .options(
                joinedload(Submission.challenge),
                joinedload(Submission.evaluation),
            )
            .where(Submission.user_id == user_id)
            .order_by(Submission.submitted_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_by_id_and_user(self, submission_id: int, user_id: int) -> Optional[Submission]:
        stmt = (
            select(Submission)
            .options(
                joinedload(Submission.challenge),
                joinedload(Submission.evaluation),
            )
            .where(Submission.id == submission_id, Submission.user_id == user_id)
        )
        return self.db.scalars(stmt).first()
