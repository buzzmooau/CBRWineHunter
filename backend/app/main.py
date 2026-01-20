"""
CBR Wine Hunter - FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import engine, Base

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events
    """
    # Startup
    logger.info("Starting CBR Wine Hunter API...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Database: {settings.database_name}")
    
    # Create database tables (in production, use Alembic migrations instead)
    # Base.metadata.create_all(bind=engine)
    
    yield
    
    # Shutdown
    logger.info("Shutting down CBR Wine Hunter API...")


# Initialize FastAPI application
app = FastAPI(
    title="CBR Wine Hunter API",
    description="API for aggregating and searching Canberra Region wines",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "status": "healthy",
        "service": "CBR Wine Hunter API",
        "version": "1.0.0",
        "environment": settings.environment
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",  # TODO: Add actual DB health check
        "timestamp": "2026-01-18T00:00:00Z"  # TODO: Add actual timestamp
    }


# TODO: Import and include routers
# from app.routers import wines, wineries, admin
# app.include_router(wines.router, prefix="/api/wines", tags=["wines"])
# app.include_router(wineries.router, prefix="/api/wineries", tags=["wineries"])
# app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

#Import Routers
from app.routers import wineries, wines
#Include Routers
app.include_router(wineries.router, prefix="/api/wineries", tags=["wineries"])
app.include_router(wines.router, prefix="/api/wines", tags=["wines"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload
    )
