# apps/api/app/api/charts.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
import uuid
from typing import Optional, List
from pathlib import Path

from app.core.database import get_db
from app.core.security import verify_token
from app.core.dependencies import get_current_user
from app.schemas.chart import ChartCreate, ChartResponse, ChartUpdate, ChartDataRequest
from app.models.chart import Chart
from app.models.dataset import Dataset
from app.models.dashboard import Dashboard
from app.models.share import Share
from app.models.user import User
from app.services.chart_service import ChartService

router = APIRouter(prefix="/charts", tags=["charts"])
security = HTTPBearer()


async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract user from token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return {"user_id": user_id}


@router.post("", response_model=ChartResponse, status_code=status.HTTP_201_CREATED)
async def create_chart(
    chart_data: ChartCreate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Create a new chart"""
    
    # Verify dataset exists and belongs to user
    stmt = select(Dataset).where(
        (Dataset.id == chart_data.dataset_id) &
        (Dataset.user_id == uuid.UUID(current_user["user_id"]))
    )
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    db_chart = Chart(
        id=uuid.uuid4(),
        dataset_id=chart_data.dataset_id,
        user_id=uuid.UUID(current_user["user_id"]),
        name=chart_data.name,
        description=chart_data.description,
        chart_type=chart_data.chart_type,
        config=chart_data.config
    )
    
    db.add(db_chart)
    await db.commit()
    await db.refresh(db_chart)
    
    return db_chart


@router.get("", response_model=list[ChartResponse])
async def list_charts(
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """List user's charts"""
    
    stmt = select(Chart).where(
        Chart.user_id == uuid.UUID(current_user["user_id"])
    ).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    charts = result.scalars().all()
    
    return charts


@router.get("/{chart_id}", response_model=ChartResponse)
async def get_chart(
    chart_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get chart by ID"""
    
    stmt = select(Chart).where(
        (Chart.id == chart_id) &
        (Chart.user_id == uuid.UUID(current_user["user_id"]))
    )
    
    result = await db.execute(stmt)
    chart = result.scalar_one_or_none()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found"
        )
    
    return chart


@router.put("/{chart_id}", response_model=ChartResponse)
async def update_chart(
    chart_id: uuid.UUID,
    chart_update: ChartUpdate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Update chart"""
    
    stmt = select(Chart).where(
        (Chart.id == chart_id) &
        (Chart.user_id == uuid.UUID(current_user["user_id"]))
    )
    
    result = await db.execute(stmt)
    chart = result.scalar_one_or_none()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found"
        )
    
    if chart_update.name:
        chart.name = chart_update.name
    if chart_update.description is not None:
        chart.description = chart_update.description
    if chart_update.config:
        chart.config = chart_update.config
    
    await db.commit()
    await db.refresh(chart)
    
    return chart


@router.delete("/{chart_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chart(
    chart_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Delete chart"""
    
    stmt = select(Chart).where(
        (Chart.id == chart_id) &
        (Chart.user_id == uuid.UUID(current_user["user_id"]))
    )
    
    result = await db.execute(stmt)
    chart = result.scalar_one_or_none()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found"
        )
    
    await db.delete(chart)
    await db.commit()


@router.post("/{chart_id}/generate-data")
async def generate_chart_data(
    chart_id: uuid.UUID,
    request: ChartDataRequest,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Generate chart data based on dataset and chart configuration"""
    
    current_user_id = uuid.UUID(current_user["user_id"])
    
    # Get chart
    stmt = select(Chart).where(Chart.id == chart_id)
    result = await db.execute(stmt)
    chart = result.scalar_one_or_none()
    
    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chart not found"
        )
    
    # Get dataset for this chart
    stmt = select(Dataset).where(Dataset.id == chart.dataset_id)
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check if dataset has a file path
    if not dataset.original_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dataset file not available"
        )
    
    try:
        # Use request values if provided, otherwise use config values
        dims = request.dimensions if request.dimensions else chart.config.get("dimensions", [])
        meas = request.measures if request.measures else chart.config.get("measures", [])
        
        # Validate based on chart type
        # Some chart types only need measures (kpi_card, gauge)
        measures_only_charts = ['kpi_card', 'gauge']
        
        if not meas:
            raise ValueError("Measures are required for chart generation")
        
        if chart.chart_type not in measures_only_charts and not dims:
            raise ValueError("Dimensions are required for this chart type")
        
        # Generate chart data
        chart_data = await ChartService.generate_chart_data(
            file_path=dataset.original_file,
            chart_type=chart.chart_type,
            dimensions=request.dimensions or chart.config.get("dimensions", []),
            measures=request.measures or chart.config.get("measures", []),
            config=chart.config
        )
        
        return chart_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error generating chart data: {str(e)}"
        )


@router.get("/dataset/{dataset_id}/columns")
async def get_dataset_columns(
    dataset_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get available columns from a dataset for chart builder"""
    
    # Get dataset
    stmt = select(Dataset).where(
        (Dataset.id == dataset_id) &
        (Dataset.user_id == uuid.UUID(current_user["user_id"]))
    )
    result = await db.execute(stmt)
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Check if dataset has a file path
    if not dataset.original_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dataset file not available. Please ensure data has been uploaded and processed."
        )
    
    try:
        columns_info = await ChartService.get_dataset_columns(dataset.original_file)
        return columns_info
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dataset file not found: {str(e)}. The file may have been deleted or moved. Please re-upload the dataset."
        )
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error getting dataset columns: {str(e)}"
        )
