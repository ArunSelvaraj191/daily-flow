from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.activities import router as activities_router

# Routers
from app.api.auth import router as auth_router
from app.api.calendar import router as calendar_router
from app.api.dashboard import router as dashboard_router
from app.api.goals import router as goals_router
from app.api.habits import router as habits_router
from app.api.reports import router as reports_router
from app.api.timers import router as timers_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import logger
from app.db.indexes import create_db_indexes
from app.db.mongodb import close_mongo_connection, connect_to_mongo, get_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    try:
        await connect_to_mongo()
        db = get_database()
        await create_db_indexes(db)
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB on startup: {e}")
        # Allow running so health check can report db status
    yield
    # Shutdown
    logger.info("Shutting down application...")
    await close_mongo_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = settings.FRONTEND_ORIGINS
if isinstance(origins, str):
    origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "statusCode": exc.status_code}
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later.", "statusCode": 500}
    )


# Health Check Endpoints
@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    db_status = "connected"
    try:
        db = get_database()
        await db.command("ping")
    except Exception as e:
        db_status = f"unhealthy: {e!s}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": settings.VERSION,
        "database": db_status
    }


# Include V1 Routers
api_v1 = f"{settings.API_V1_PREFIX}"
app.include_router(auth_router, prefix=api_v1)
app.include_router(activities_router, prefix=api_v1)
app.include_router(timers_router, prefix=api_v1)
app.include_router(dashboard_router, prefix=api_v1)
app.include_router(habits_router, prefix=api_v1)
app.include_router(goals_router, prefix=api_v1)
app.include_router(calendar_router, prefix=api_v1)
app.include_router(reports_router, prefix=api_v1)
