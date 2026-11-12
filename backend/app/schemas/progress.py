from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ConceptMasteryRead(BaseModel):
    id: int
    concept_id: int
    concept_name: str
    subject_name: str
    mastery_score: float
    total_attempts: int
    correct_attempts: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LearningHistoryRead(BaseModel):
    id: int
    activity_type: str
    activity_description: str
    score: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConceptPerformance(BaseModel):
    concept_id: int
    concept_name: str
    subject_name: str
    mastery_score: float
    status: str  # "Mastered", "Proficient", "Needs Practice", "Critical Gap"


class RecommendedAction(BaseModel):
    concept_id: int
    concept_name: str
    subject_name: str
    difficulty: str
    reason: str


class StudentProgressSummary(BaseModel):
    total_challenges_completed: int
    average_score: float
    learning_streak: int
    concepts_mastered: int
    total_attempts: int
    strong_concepts: List[ConceptPerformance]
    weak_concepts: List[ConceptPerformance]
    recent_activities: List[LearningHistoryRead]
    recommended_challenges: List[RecommendedAction]
    learning_curve: List[dict]  # Historical data points for chart
