from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.models.subject import Subject
from app.repositories.base_repo import BaseRepository


class SubjectRepository(BaseRepository[Subject]):
    def __init__(self, db: Session):
        super().__init__(Subject, db)

    def get_by_name(self, name: str) -> Optional[Subject]:
        stmt = select(Subject).where(Subject.subject_name.ilike(name.strip()))
        return self.db.scalars(stmt).first()

    def get_all_with_concepts(self) -> List[Subject]:
        stmt = select(Subject).options(joinedload(Subject.concepts))
        return list(self.db.scalars(stmt).unique().all())
