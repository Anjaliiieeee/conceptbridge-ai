from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: str = "student"
    preferred_language: Optional[str] = "Python"
    preferred_difficulty: Optional[str] = "Beginner"


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    preferred_language: Optional[str] = None
    preferred_difficulty: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class UserProfile(UserRead):
    total_submissions: int = 0
    average_score: float = 0.0
    concepts_mastered: int = 0
    current_streak: int = 0
