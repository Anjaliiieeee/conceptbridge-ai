from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, ConfigDict


class EvaluationRead(BaseModel):
    id: int
    submission_id: int
    score: int
    is_correct: bool
    explanation: str
    mistakes: str
    conceptual_gap: str
    suggested_improvement: str
    correct_approach: str
    recommended_challenge: Optional[str] = None
    created_at: datetime

    # Associated challenge data for rich client display
    challenge_id: Optional[int] = None
    challenge_title: Optional[str] = None
    concept_name: Optional[str] = None
    subject_name: Optional[str] = None
    submitted_answer: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AIEvaluationOutput(BaseModel):
    """Structured output expected from AI evaluation engine."""
    score: int
    is_correct: bool
    explanation: str
    mistakes: List[str]
    conceptual_gap: str
    suggested_improvement: str
    correct_approach: str
    recommended_challenge: str


class AIChallengeOutput(BaseModel):
    """Structured output expected from AI challenge generator."""
    title: str
    description: str
    real_world_scenario: str
    requirements: str
    examples: str
    expected_solution: str
    evaluation_criteria: str
