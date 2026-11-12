from typing import Optional
from pydantic import BaseModel, ConfigDict


class ConceptBase(BaseModel):
    concept_name: str
    description: Optional[str] = None
    difficulty_level: str = "Beginner"


class ConceptRead(ConceptBase):
    id: int
    subject_id: int

    model_config = ConfigDict(from_attributes=True)
