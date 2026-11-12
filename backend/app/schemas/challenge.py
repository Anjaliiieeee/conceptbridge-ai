from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, ConfigDict, Field


class ChallengeGenerateRequest(BaseModel):
    subject_id: Optional[int] = None
    subject_name: Optional[str] = None
    concept_id: Optional[int] = None
    concept_name: Optional[str] = None
    difficulty: str = Field("Beginner", description="Beginner, Intermediate, or Advanced")
    focus_weak_areas: bool = Field(False, description="Whether to target identified conceptual gaps")


class ChallengeBase(BaseModel):
    title: str
    description: str
    difficulty: str
    real_world_scenario: str
    requirements: str
    examples: Optional[str] = None


class ChallengeRead(ChallengeBase):
    id: int
    subject_id: int
    concept_id: int
    subject_name: Optional[str] = None
    concept_name: Optional[str] = None
    is_ai_generated: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChallengeDetail(ChallengeRead):
    expected_solution: Optional[str] = None
    evaluation_criteria: Optional[str] = None
