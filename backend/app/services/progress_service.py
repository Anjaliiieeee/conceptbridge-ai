from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.mastery_repo import ConceptMasteryRepository
from app.repositories.history_repo import LearningHistoryRepository
from app.repositories.submission_repo import SubmissionRepository
from app.repositories.concept_repo import ConceptRepository
from app.schemas.progress import (
    StudentProgressSummary,
    ConceptPerformance,
    RecommendedAction,
    LearningHistoryRead,
)


class ProgressService:
    def __init__(self, db: Session):
        self.db = db
        self.mastery_repo = ConceptMasteryRepository(db)
        self.history_repo = LearningHistoryRepository(db)
        self.submission_repo = SubmissionRepository(db)
        self.concept_repo = ConceptRepository(db)

    def get_summary(self, user_id: int) -> StudentProgressSummary:
        """Compute holistic student progress, learning curve, streaks, and recommendations."""
        submissions = self.submission_repo.get_user_submissions(user_id, limit=200)
        masteries = self.mastery_repo.get_all_by_user(user_id)
        histories = self.history_repo.get_by_user(user_id, limit=15)

        total_challenges_completed = len(submissions)
        evaluated = [s.evaluation for s in submissions if s.evaluation is not None]

        average_score = 0.0
        if evaluated:
            average_score = round(sum(e.score for e in evaluated) / len(evaluated), 1)

        # Learning streak calculation
        streak = self._calculate_streak(histories)

        # Strong and weak concepts categorization
        strong_concepts: List[ConceptPerformance] = []
        weak_concepts: List[ConceptPerformance] = []
        concepts_mastered = 0

        for m in masteries:
            c_name = m.concept.concept_name if m.concept else f"Concept #{m.concept_id}"
            s_name = m.concept.subject.subject_name if m.concept and m.concept.subject else "General"

            if m.mastery_score >= 80:
                concepts_mastered += 1
                status = "Mastered"
                strong_concepts.append(
                    ConceptPerformance(
                        concept_id=m.concept_id,
                        concept_name=c_name,
                        subject_name=s_name,
                        mastery_score=m.mastery_score,
                        status=status,
                    )
                )
            elif m.mastery_score >= 65:
                status = "Proficient"
                strong_concepts.append(
                    ConceptPerformance(
                        concept_id=m.concept_id,
                        concept_name=c_name,
                        subject_name=s_name,
                        mastery_score=m.mastery_score,
                        status=status,
                    )
                )
            elif m.mastery_score >= 40:
                status = "Needs Practice"
                weak_concepts.append(
                    ConceptPerformance(
                        concept_id=m.concept_id,
                        concept_name=c_name,
                        subject_name=s_name,
                        mastery_score=m.mastery_score,
                        status=status,
                    )
                )
            else:
                status = "Critical Gap"
                weak_concepts.append(
                    ConceptPerformance(
                        concept_id=m.concept_id,
                        concept_name=c_name,
                        subject_name=s_name,
                        mastery_score=m.mastery_score,
                        status=status,
                    )
                )

        # Generate targeted recommendations
        recommended_challenges = self._build_recommendations(weak_concepts, strong_concepts)

        # Historical scores for progress chart
        learning_curve = []
        reversed_evals = list(reversed(evaluated[-10:]))
        for idx, ev in enumerate(reversed_evals):
            learning_curve.append({
                "index": idx + 1,
                "score": ev.score,
                "date": ev.created_at.strftime("%b %d"),
                "is_correct": ev.is_correct,
            })

        # Convert histories to schemas
        recent_activity_schemas = [
            LearningHistoryRead(
                id=h.id,
                activity_type=h.activity_type,
                activity_description=h.activity_description,
                score=h.score,
                created_at=h.created_at,
            )
            for h in histories
        ]

        return StudentProgressSummary(
            total_challenges_completed=total_challenges_completed,
            average_score=average_score,
            learning_streak=streak,
            concepts_mastered=concepts_mastered,
            total_attempts=sum(m.total_attempts for m in masteries),
            strong_concepts=strong_concepts[:5],
            weak_concepts=weak_concepts[:5],
            recent_activities=recent_activity_schemas,
            recommended_challenges=recommended_challenges,
            learning_curve=learning_curve,
        )

    def _calculate_streak(self, histories) -> int:
        """Calculate continuous consecutive days with completed activities."""
        if not histories:
            return 0

        dates = sorted(
            list({h.created_at.date() for h in histories}),
            reverse=True,
        )
        if not dates:
            return 0

        today = datetime.now(timezone.utc).date()
        # If the most recent active date is older than yesterday, streak is broken
        if dates[0] < today - timedelta(days=1):
            return 0

        streak = 1
        current = dates[0]
        for next_date in dates[1:]:
            if next_date == current - timedelta(days=1):
                streak += 1
                current = next_date
            else:
                break
        return streak

    def _build_recommendations(
        self,
        weak_concepts: List[ConceptPerformance],
        strong_concepts: List[ConceptPerformance],
    ) -> List[RecommendedAction]:
        recommendations = []
        # Priority 1: Address identified weak concepts
        for w in weak_concepts[:2]:
            recommendations.append(
                RecommendedAction(
                    concept_id=w.concept_id,
                    concept_name=w.concept_name,
                    subject_name=w.subject_name,
                    difficulty="Beginner" if w.status == "Critical Gap" else "Intermediate",
                    reason=f"Targeted practice to bridge your {w.status.lower()} gap ({w.mastery_score}% mastery).",
                )
            )

        # Priority 2: Stretch goals for mastered concepts
        for s in strong_concepts[:1]:
            recommendations.append(
                RecommendedAction(
                    concept_id=s.concept_id,
                    concept_name=s.concept_name,
                    subject_name=s.subject_name,
                    difficulty="Advanced",
                    reason=f"Advance your mastery in {s.concept_name} with enterprise production scenarios.",
                )
            )

        # Fallback default if student is brand new
        if not recommendations:
            recommendations.append(
                RecommendedAction(
                    concept_id=1,
                    concept_name="Variables & Data Types",
                    subject_name="Python",
                    difficulty="Beginner",
                    reason="Recommended diagnostic baseline to start your learning journey.",
                )
            )

        return recommendations
