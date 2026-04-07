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
from app.models.relationship import Measure
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
    
    try:
        from app.models.chart import ChartType
        
        user_id = uuid.UUID(current_user["user_id"])
        print(f"[DEBUG] Creating chart for user: {user_id}")
        print(f"[DEBUG] Chart data: name={chart_data.name}, dataset_id={chart_data.dataset_id}, type={chart_data.chart_type}")
        
        # Verify dataset exists and belongs to user
        stmt = select(Dataset).where(
            (Dataset.id == chart_data.dataset_id) &
            (Dataset.user_id == user_id)
        )
        result = await db.execute(stmt)
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            print(f"[ERROR] Dataset {chart_data.dataset_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        # Convert chart_type string to proper enum member (accept both cases)
        try:
            # Try uppercase first (preferred)
            chart_type_str = chart_data.chart_type.upper() if isinstance(chart_data.chart_type, str) else chart_data.chart_type
            chart_type_enum = ChartType[chart_type_str]
        except (KeyError, AttributeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid chart type: {chart_data.chart_type}. Valid types are: {[e.name for e in ChartType]}"
            )
        
        chart_id = uuid.uuid4()
        db_chart = Chart(
            id=chart_id,
            dataset_id=chart_data.dataset_id,
            user_id=user_id,
            name=chart_data.name,
            description=chart_data.description,
            chart_type=chart_type_enum,
            config=chart_data.config or {"dimensions": [], "measures": []}
        )
        
        db.add(db_chart)
        await db.commit()
        await db.refresh(db_chart)
        
        print(f"[DEBUG] Chart created successfully: {chart_id}")
        return db_chart
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to create chart: {str(e)}")
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating chart: {str(e)}"
        )


@router.get("", response_model=list[ChartResponse])
async def list_charts(
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """List user's charts"""
    
    try:
        user_id = uuid.UUID(current_user["user_id"])
        print(f"[DEBUG] Fetching charts for user: {user_id}")
        
        stmt = select(Chart).where(
            Chart.user_id == user_id
        ).offset(skip).limit(limit)
        
        result = await db.execute(stmt)
        charts = result.scalars().all()
        
        print(f"[DEBUG] Found {len(charts)} charts for user {user_id}")
        for chart in charts:
            print(f"[DEBUG]   - Chart: {chart.id}, Name: {chart.name}, Type: {chart.chart_type}")
        
        return charts
    except Exception as e:
        print(f"[ERROR] Failed to list charts: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error listing charts: {str(e)}"
        )


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
    
    try:
        user_id = uuid.UUID(current_user["user_id"])
        print(f"[DEBUG] Updating chart {chart_id} for user {user_id}")
        
        stmt = select(Chart).where(
            (Chart.id == chart_id) &
            (Chart.user_id == user_id)
        )
        
        result = await db.execute(stmt)
        chart = result.scalar_one_or_none()
        
        if not chart:
            print(f"[ERROR] Chart {chart_id} not found for user {user_id}")
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
            print(f"[DEBUG] Updated chart config: {chart_update.config}")
        
        await db.commit()
        await db.refresh(chart)
        
        print(f"[DEBUG] Chart updated successfully: {chart_id}")
        return chart
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Failed to update chart: {str(e)}")
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating chart: {str(e)}"
        )


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
        # Some chart types only need measures (KPI_CARD, GAUGE)
        from app.models.chart import ChartType
        measures_only_charts = [ChartType.KPI_CARD, ChartType.GAUGE]
        
        if not meas:
            raise ValueError("Measures are required for chart generation")
        
        if chart.chart_type not in measures_only_charts and not dims:
            raise ValueError("Dimensions are required for this chart type")
        
        # Fetch custom measures from database to resolve formulas
        measure_mapping = {}
        if meas:
            stmt = select(Measure).where(
                (Measure.dataset_id == chart.dataset_id) &
                (Measure.name.in_(meas))
            )
            result = await db.execute(stmt)
            custom_measures = result.scalars().all()
            for measure in custom_measures:
                measure_mapping[measure.name] = {
                    "formula": measure.formula,
                    "data_type": measure.data_type
                }
        
        # Generate chart data
        chart_data = await ChartService.generate_chart_data(
            file_path=dataset.original_file,
            chart_type=chart.chart_type,
            dimensions=dims,
            measures=meas,
            config=chart.config,
            measure_formulas=measure_mapping
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
