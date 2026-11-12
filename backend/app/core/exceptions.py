from typing import Any, Optional


class AppException(Exception):
    """Base exception for ConceptBridge AI application."""

    def __init__(self, message: str, status_code: int = 400, details: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class EntityNotFoundException(AppException):
    """Raised when a requested resource is not found."""

    def __init__(self, entity_name: str, identifier: Any):
        super().__init__(
            message=f"{entity_name} with identifier '{identifier}' was not found.",
            status_code=404,
        )


class AuthenticationFailedException(AppException):
    """Raised when authentication credentials cannot be validated."""

    def __init__(self, message: str = "Invalid email or password."):
        super().__init__(message=message, status_code=401)


class AuthorizationFailedException(AppException):
    """Raised when user lacks permission to access resource."""

    def __init__(self, message: str = "You do not have permission to access this resource."):
        super().__init__(message=message, status_code=403)


class ConflictException(AppException):
    """Raised when an entity conflict occurs (e.g. duplicate email)."""

    def __init__(self, message: str = "Resource already exists."):
        super().__init__(message=message, status_code=409)


class ValidationException(AppException):
    """Raised when application-level validation fails."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(message=message, status_code=422, details=details)


class AIServiceException(AppException):
    """Raised when AI service call fails."""

    def __init__(self, message: str = "AI service request failed.", details: Optional[Any] = None):
        super().__init__(message=message, status_code=502, details=details)
