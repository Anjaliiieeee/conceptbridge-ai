from typing import List, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.subject import Subject
    from app.models.challenge import Challenge
    from app.models.mastery import ConceptMastery


class Concept(Base):
    __tablename__ = "concepts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    subject_id: Mapped[int] = mapped_column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_name: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    difficulty_level: Mapped[str] = mapped_column(String(50), default="Beginner", nullable=False)

    # Relationships
    subject: Mapped["Subject"] = relationship("Subject", back_populates="concepts")
    challenges: Mapped[List["Challenge"]] = relationship("Challenge", back_populates="concept", cascade="all, delete-orphan")
    masteries: Mapped[List["ConceptMastery"]] = relationship("ConceptMastery", back_populates="concept", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Concept id={self.id} name={self.concept_name} difficulty={self.difficulty_level}>"
