from app.services.ai_service import AIService, ai_service
from app.services.auth_service import AuthService
from app.services.challenge_service import ChallengeService
from app.services.evaluation_service import EvaluationService
from app.services.progress_service import ProgressService
from app.services.user_service import UserService

__all__ = [
    "AIService",
    "ai_service",
    "AuthService",
    "ChallengeService",
    "EvaluationService",
    "ProgressService",
    "UserService",
]
