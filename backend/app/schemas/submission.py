from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SubmissionCreate(BaseModel):
    challenge_id: int = Field(..., description="Target challenge identifier")
    submitted_answer: str = Field(..., min_length=2, description="Student code or technical solution")


class SubmissionRead(BaseModel):
    id: int
    user_id: int
    challenge_id: int
    submitted_answer: str
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
