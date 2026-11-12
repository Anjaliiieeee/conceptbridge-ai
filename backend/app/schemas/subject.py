from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.concept import ConceptRead


class SubjectBase(BaseModel):
    subject_name: str
    description: Optional[str] = None
    icon: Optional[str] = "code"


class SubjectRead(SubjectBase):
    id: int
    concepts_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class SubjectWithConcepts(SubjectBase):
    id: int
    concepts: List[ConceptRead] = []

    model_config = ConfigDict(from_attributes=True)
