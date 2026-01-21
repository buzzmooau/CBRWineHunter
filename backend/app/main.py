"""
FastAPI main application for CBR Wine Hunter
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import wineries, wines, admin

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CBR Wine Hunter API",
    description="API for aggregating wine listings from Canberra Region wineries",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(wineries.router)
app.include_router(wines.router)
app.include_router(admin.router)


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Welcome to CBR Wine Hunter API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
