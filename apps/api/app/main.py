 # apps/api/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn

from app.core.config import settings
from app.core.middleware import RateLimitMiddleware

# Import all models to register them with SQLAlchemy before loading routers
from app.models import (
    BaseModel,
    User,
    Dataset,
    Transformation,
    Measure,
    CalculatedColumn,
    Hierarchy,
    Chart,
    Dashboard,
    Share,
    Relationship,
    DataTable,
    DataWarehouse,
    WarehouseRelationship,
)

from app.api import auth, datasets, charts, dashboards, filters, shares, relationships, users, modeling, warehouse, transformations

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Add rate limiting middleware (before CORS to check all requests)
app.add_middleware(RateLimitMiddleware)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted Host Middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(datasets.router, prefix=settings.API_V1_STR)
app.include_router(charts.router, prefix=settings.API_V1_STR)
app.include_router(dashboards.router, prefix=settings.API_V1_STR)
app.include_router(filters.router, prefix=settings.API_V1_STR)
app.include_router(shares.router, prefix=settings.API_V1_STR)
app.include_router(relationships.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(modeling.router, prefix=settings.API_V1_STR)
app.include_router(warehouse.router, prefix=settings.API_V1_STR)
app.include_router(transformations.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "BI Platform API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False,
    )
