from fastapi import APIRouter, Depends, status
from app.schemas.auth import UserRegister, UserLogin, Token
from app.schemas.user import UserRead
from app.models.user import User
from app.services.auth_service import AuthService
from app.api.dependencies import get_auth_service, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserRegister,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Register a new student user account and return JWT access token."""
    return auth_service.register(payload)


@router.post("/login", response_model=Token)
def login(
    payload: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Authenticate student user and return JWT access token."""
    return auth_service.login(payload)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Log out student user (stateless JWT client cleanup)."""
    return {"message": "Logged out successfully", "user_id": current_user.id}


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated student user details."""
    return current_user
