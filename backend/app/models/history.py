from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utc_now

if TYPE_CHECKING:
    from app.models.user import User


class LearningHistory(Base):
    __tablename__ = "learning_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type: Mapped[str] = mapped_column(String(80), nullable=False)  # e.g. "challenge_completed", "diagnostic", "streak_bonus"
    activity_description: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="histories")

    def __repr__(self) -> str:
        return f"<LearningHistory user={self.user_id} type={self.activity_type}>"
