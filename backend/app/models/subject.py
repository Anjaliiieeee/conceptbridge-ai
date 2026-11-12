from typing import List, TYPE_CHECKING
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.concept import Concept
    from app.models.challenge import Challenge


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    subject_name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    icon: Mapped[str] = mapped_column(String(50), default="code", nullable=True)

    # Relationships
    concepts: Mapped[List["Concept"]] = relationship("Concept", back_populates="subject", cascade="all, delete-orphan")
    challenges: Mapped[List["Challenge"]] = relationship("Challenge", back_populates="subject", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Subject id={self.id} name={self.subject_name}>"
