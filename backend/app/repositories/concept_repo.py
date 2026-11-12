from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.concept import Concept
from app.repositories.base_repo import BaseRepository


class ConceptRepository(BaseRepository[Concept]):
    def __init__(self, db: Session):
        super().__init__(Concept, db)

    def get_by_subject_and_name(self, subject_id: int, concept_name: str) -> Optional[Concept]:
        stmt = select(Concept).where(
            Concept.subject_id == subject_id,
            Concept.concept_name.ilike(concept_name.strip()),
        )
        return self.db.scalars(stmt).first()

    def get_by_subject_id(self, subject_id: int) -> List[Concept]:
        stmt = select(Concept).where(Concept.subject_id == subject_id)
        return list(self.db.scalars(stmt).all())

    def get_by_name_global(self, concept_name: str) -> Optional[Concept]:
        stmt = select(Concept).where(Concept.concept_name.ilike(concept_name.strip()))
        return self.db.scalars(stmt).first()
