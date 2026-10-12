from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundException(AppException):
    def __init__(self, resource: str = "Resource", id_val: str = ""):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id '{id_val}' not found." if id_val else f"{resource} not found."
        )


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Access forbidden"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class BadRequestException(AppException):
    def __init__(self, detail: str = "Invalid request"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


class ConflictException(AppException):
    def __init__(self, detail: str = "Resource conflict occurred"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )
