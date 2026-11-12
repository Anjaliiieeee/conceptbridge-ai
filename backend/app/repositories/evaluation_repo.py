from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.models.evaluation import Evaluation
from app.models.submission import Submission
from app.repositories.base_repo import BaseRepository


class EvaluationRepository(BaseRepository[Evaluation]):
    def __init__(self, db: Session):
        super().__init__(Evaluation, db)

    def get_by_submission_id(self, submission_id: int) -> Optional[Evaluation]:
        stmt = (
            select(Evaluation)
            .options(
                joinedload(Evaluation.submission).joinedload(Submission.challenge),
                joinedload(Evaluation.submission).joinedload(Submission.user),
            )
            .where(Evaluation.submission_id == submission_id)
        )
        return self.db.scalars(stmt).first()

    def get_user_evaluation_by_submission_id(self, submission_id: int, user_id: int) -> Optional[Evaluation]:
        stmt = (
            select(Evaluation)
            .join(Submission, Evaluation.submission_id == Submission.id)
            .options(
                joinedload(Evaluation.submission).joinedload(Submission.challenge),
            )
            .where(Evaluation.submission_id == submission_id, Submission.user_id == user_id)
        )
        return self.db.scalars(stmt).first()
