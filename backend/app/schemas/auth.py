from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of student")
    email: EmailStr = Field(..., description="Valid student email address")
    password: str = Field(..., min_length=6, max_length=128, description="Secure password")
    preferred_language: Optional[str] = Field("Python", description="Primary programming language")
    preferred_difficulty: Optional[str] = Field("Beginner", description="Target difficulty level")


class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Student email address")
    password: str = Field(..., min_length=1, description="Password")


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None
    exp: Optional[int] = None
