from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Text, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utc_now

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.challenge import Challenge
    from app.models.evaluation import Evaluation


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    challenge_id: Mapped[int] = mapped_column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    submitted_answer: Mapped[str] = mapped_column(Text, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="submissions")
    challenge: Mapped["Challenge"] = relationship("Challenge", back_populates="submissions")
    evaluation: Mapped[Optional["Evaluation"]] = relationship("Evaluation", back_populates="submission", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Submission id={self.id} user_id={self.user_id} challenge_id={self.challenge_id}>"
