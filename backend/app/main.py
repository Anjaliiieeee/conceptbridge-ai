from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.logging_config import logger
from app.core.database import create_db_and_tables, SessionLocal
from app.core.exceptions import AppException
from app.utils.seed_data import seed_database
from app.api.routes import (
    auth_router,
    subjects_router,
    challenges_router,
    evaluations_router,
    progress_router,
    profile_router,
    health_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: initialize database tables and seed initial catalog."""
    logger.info("Initializing ConceptBridge AI database schema...")
    create_db_and_tables()

    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.error(f"Error during database seeding: {e}")
    finally:
        db.close()

    logger.info("ConceptBridge AI backend startup completed successfully.")
    yield
    logger.info("ConceptBridge AI backend shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Bridge the Gap Between Knowing and Doing — Practical AI-Powered Conceptual Coding Platform",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/openapi.json",
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Centralized Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    logger.warning(f"Handled AppException: {exc.message} (status={exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "details": exc.details,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    formatted_errors = [{"loc": err["loc"], "msg": err["msg"], "type": err["type"]} for err in errors]
    logger.warning(f"Validation error on {request.url.path}: {formatted_errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "message": "Input validation failed. Please check the submitted fields.",
            "details": formatted_errors,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "An unexpected internal server error occurred.",
        },
    )


# Register API Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(subjects_router, prefix=settings.API_V1_STR)
app.include_router(challenges_router, prefix=settings.API_V1_STR)
app.include_router(evaluations_router, prefix=settings.API_V1_STR)
app.include_router(progress_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": "Bridge the Gap Between Knowing and Doing",
        "version": settings.VERSION,
        "docs": "/docs",
        "api": settings.API_V1_STR,
    }
