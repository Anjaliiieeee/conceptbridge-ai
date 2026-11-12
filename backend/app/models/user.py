from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utc_now

if TYPE_CHECKING:
    from app.models.submission import Submission
    from app.models.mastery import ConceptMastery
    from app.models.history import LearningHistory


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="student", nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(50), default="Python", nullable=True)
    preferred_difficulty: Mapped[str] = mapped_column(String(50), default="Beginner", nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    submissions: Mapped[List["Submission"]] = relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    masteries: Mapped[List["ConceptMastery"]] = relationship("ConceptMastery", back_populates="user", cascade="all, delete-orphan")
    histories: Mapped[List["LearningHistory"]] = relationship("LearningHistory", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
