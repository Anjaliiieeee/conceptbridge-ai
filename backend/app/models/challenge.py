from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utc_now

if TYPE_CHECKING:
    from app.models.subject import Subject
    from app.models.concept import Concept
    from app.models.submission import Submission


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_id: Mapped[int] = mapped_column(Integer, ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="Beginner", nullable=False)
    real_world_scenario: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[str] = mapped_column(Text, nullable=False)
    examples: Mapped[str] = mapped_column(Text, nullable=True)
    expected_solution: Mapped[str] = mapped_column(Text, nullable=False)
    evaluation_criteria: Mapped[str] = mapped_column(Text, nullable=False)
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    subject: Mapped["Subject"] = relationship("Subject", back_populates="challenges")
    concept: Mapped["Concept"] = relationship("Concept", back_populates="challenges")
    submissions: Mapped[List["Submission"]] = relationship("Submission", back_populates="challenge", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Challenge id={self.id} title={self.title} difficulty={self.difficulty}>"
