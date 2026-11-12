from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Text, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utc_now

if TYPE_CHECKING:
    from app.models.submission import Submission


class Evaluation(Base):
    __tablename__ = "evaluations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    submission_id: Mapped[int] = mapped_column(Integer, ForeignKey("submissions.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    score: Mapped[int] = mapped_column(Integer, nullable=False)  # 0 to 100
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    mistakes: Mapped[str] = mapped_column(Text, nullable=False)  # JSON-encoded array or bulleted text
    conceptual_gap: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_improvement: Mapped[str] = mapped_column(Text, nullable=False)
    correct_approach: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_challenge: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    submission: Mapped["Submission"] = relationship("Submission", back_populates="evaluation")

    def __repr__(self) -> str:
        return f"<Evaluation id={self.id} submission_id={self.submission_id} score={self.score}>"
