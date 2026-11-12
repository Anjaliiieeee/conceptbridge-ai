from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utc_now

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.concept import Concept


class ConceptMastery(Base):
    __tablename__ = "concept_mastery"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    concept_id: Mapped[int] = mapped_column(Integer, ForeignKey("concepts.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # 0 to 100
    total_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    correct_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "concept_id", name="uq_user_concept"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="masteries")
    concept: Mapped["Concept"] = relationship("Concept", back_populates="masteries")

    def __repr__(self) -> str:
        return f"<ConceptMastery user={self.user_id} concept={self.concept_id} score={self.mastery_score}>"
