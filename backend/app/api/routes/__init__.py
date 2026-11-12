from app.api.routes.auth import router as auth_router
from app.api.routes.subjects import router as subjects_router
from app.api.routes.challenges import router as challenges_router
from app.api.routes.evaluations import router as evaluations_router
from app.api.routes.progress import router as progress_router
from app.api.routes.profile import router as profile_router
from app.api.routes.health import router as health_router

__all__ = [
    "auth_router",
    "subjects_router",
    "challenges_router",
    "evaluations_router",
    "progress_router",
    "profile_router",
    "health_router",
]
