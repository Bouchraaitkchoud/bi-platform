# apps/api/app/api/datasets.py
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import os
import shutil
from pathlib import Path

from app.core.database import get_db
from app.core.security import verify_token
from app.core.dependencies import get_current_user
from app.schemas.dataset import DatasetCreate, DatasetResponse, DatasetUpdate, DatasetPreview
from app.schemas.data_cleaning import DataQualityAnalysis, ColumnStatistics, CleaningPlan
from app.models.dataset import Dataset
from app.models.user import User
from app.services.dataset_service import extract_dataset_metadata, get_dataset_preview
from app.services.data_cleaning_service import analyze_data_quality, get_column_statistics
from app.services.data_operations_service import DataOperationsService, apply_cleaning_operations

router = APIRouter(prefix="/datasets", tags=["datasets"])
security = HTTPBearer()

# Create storage directory if it doesn't exist
STORAGE_DIR = Path("storage/datasets")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# File upload configuration
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


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


@router.post("", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def create_dataset(
    dataset_data: DatasetCreate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Create a new dataset"""
    
    db_dataset = Dataset(
        id=uuid.uuid4(),
        user_id=uuid.UUID(current_user["user_id"]),
        name=dataset_data.name,
        description=dataset_data.description,
        original_file=f"dataset_{uuid.uuid4()}.{dataset_data.file_type}",
        file_type=dataset_data.file_type,
        columns_metadata={}
    )
    
    db.add(db_dataset)
    await db.commit()
    await db.refresh(db_dataset)
    
    return db_dataset


@router.post("/upload/file", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    name: str = None,
    description: str = None,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Upload a file and create a new dataset"""
    
    # Validate file
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content to check size
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty"
        )
    
    # Determine file type
    file_type = file_extension.lstrip('.')
    if file_type == "xls":
        file_type = "xlsx"  # Treat .xls as .xlsx
    
    # Generate unique filename
    dataset_id = uuid.uuid4()
    safe_filename = f"{dataset_id}{file_extension}"
    file_path = STORAGE_DIR / safe_filename
    
    try:
        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Extract metadata
        metadata = await extract_dataset_metadata(str(file_path), file_type)
        
        # Set default name if not provided
        if not name:
            name = Path(file.filename).stem  # Use filename without extension
        
        # Create dataset record - store the actual file path
        db_dataset = Dataset(
            id=dataset_id,
            user_id=uuid.UUID(current_user["user_id"]),
            name=name,
            description=description,
            original_file=str(file_path),  # Store full path to the saved file
            file_type=file_type,
            row_count=metadata.get("row_count", 0),
            column_count=metadata.get("column_count", 0),
            columns_metadata=metadata.get("columns_metadata", {}),
            file_size=file_size
        )
        
        db.add(db_dataset)
        await db.commit()
        await db.refresh(db_dataset)
        
        return db_dataset
        
    except Exception as e:
        # Clean up file if something goes wrong
        if file_path.exists():
            file_path.unlink()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )


@router.get("", response_model=list[DatasetResponse])
async def list_datasets(
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """List user's datasets"""
    
    stmt = select(Dataset).where(
        Dataset.user_id == uuid.UUID(current_user["user_id"])
    ).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    datasets = result.scalars().all()
    
    return datasets


@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
async def get_dataset_preview_endpoint(
    dataset_id: uuid.UUID,
    limit: int = 100000,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get preview of dataset data"""
    
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
    
    # Construct file path - file is saved as {dataset_id}{.extension}
    file_extension = f".{dataset.file_type.value}"
    safe_filename = f"{dataset_id}{file_extension}"
    file_path = STORAGE_DIR / safe_filename
    
    print(f"[DEBUG] Looking for file at: {file_path}")
    print(f"[DEBUG] File exists: {file_path.exists()}")
    print(f"[DEBUG] STORAGE_DIR: {STORAGE_DIR}")
    print(f"[DEBUG] Files in storage: {list(STORAGE_DIR.iterdir()) if STORAGE_DIR.exists() else 'DIR NOT FOUND'}")
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset file not found. Expected at: {file_path}"
        )
    
    try:
        preview = await get_dataset_preview(str(file_path), dataset.file_type.value, limit)
        print(f"[DEBUG] Preview generated successfully: {len(preview.get('sample_data', []))} rows")
        return preview
    except Exception as e:
        import traceback
        error_detail = f"Error getting preview: {str(e)}\n{traceback.format_exc()}"
        print(f"[DEBUG] {error_detail}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading file: {str(e)}"
        )


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get dataset by ID"""
    
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
    
    return dataset


@router.put("/{dataset_id}", response_model=DatasetResponse)
async def update_dataset(
    dataset_id: uuid.UUID,
    dataset_update: DatasetUpdate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Update dataset"""
    
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
    
    if dataset_update.name:
        dataset.name = dataset_update.name
    if dataset_update.description is not None:
        dataset.description = dataset_update.description
    
    await db.commit()
    await db.refresh(dataset)
    
    return dataset


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(
    dataset_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Delete dataset"""
    
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
    
    # Delete file if it exists
    file_extension = f".{dataset.file_type.value}"
    safe_filename = f"{dataset_id}{file_extension}"
    file_path = STORAGE_DIR / safe_filename
    if file_path.exists():
        file_path.unlink()
    
    await db.delete(dataset)
    await db.commit()





@router.post("/{dataset_id}/upload")
async def upload_dataset_file(
    dataset_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a file to dataset"""
    
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
    
    # TODO: Implement file upload logic
    # For now, just update the file info
    dataset.file_size = len(await file.read())
    
    await db.commit()
    await db.refresh(dataset)
    
    return {"message": "File uploaded successfully"}


# ============ DATA CLEANING ENDPOINTS ============

@router.get("/{dataset_id}/quality", response_model=DataQualityAnalysis)
async def analyze_dataset_quality(
    dataset_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Analyze data quality of a dataset"""
    
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
    
    file_extension = f".{dataset.file_type.value}"
    safe_filename = f"{dataset_id}{file_extension}"
    file_path = STORAGE_DIR / safe_filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset file not found"
        )
    
    try:
        quality_analysis = await analyze_data_quality(str(file_path), dataset.file_type.value)
        return quality_analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing data quality: {str(e)}"
        )


@router.get("/{dataset_id}/columns/{column_name}/stats", response_model=ColumnStatistics)
async def get_column_stats(
    dataset_id: uuid.UUID,
    column_name: str,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed statistics for a specific column"""
    
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
    
    file_extension = f".{dataset.file_type.value}"
    safe_filename = f"{dataset_id}{file_extension}"
    file_path = STORAGE_DIR / safe_filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset file not found"
        )
    
    try:
        stats = await get_column_statistics(str(file_path), dataset.file_type.value, column_name)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing column: {str(e)}"
        )


@router.post("/{dataset_id}/clean")
async def apply_dataset_cleaning(
    dataset_id: uuid.UUID,
    cleaning_plan: CleaningPlan,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Apply cleaning operations to a dataset"""
    
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
    
    file_extension = f".{dataset.file_type.value}"
    safe_filename = f"{dataset_id}{file_extension}"
    file_path = STORAGE_DIR / safe_filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset file not found"
        )
    
    try:
        # Convert CleaningPlan operations to operations list
        operations = []
        if cleaning_plan.operations:
            for op in cleaning_plan.operations:
                operations.append({
                    "type": op.operation_type,
                    "params": op.parameters
                })
        
        # Apply operations
        result = DataOperationsService.apply_operations(
            str(file_path),
            dataset.file_type.value,
            operations
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to apply cleaning operations")
            )
        
        # Save the cleaned data back to the original file
        df = result.pop("dataframe")
        DataOperationsService.save_dataframe(df, str(file_path), dataset.file_type.value)
        
        # Update dataset metadata
        dataset.row_count = result["after"]["rows"]
        dataset.column_count = result["after"]["columns"]
        
        await db.commit()
        await db.refresh(dataset)
        
        return {
            "success": True,
            "message": "Cleaning operations applied successfully",
            "before": result["before"],
            "after": result["after"],
            "transformations_applied": result["transformations_applied"],
            "dataset": dataset
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error applying cleaning operations: {str(e)}"
        )


@router.post("/{dataset_id}/preview-operations")
async def preview_cleaning_operations(
    dataset_id: uuid.UUID,
    cleaning_plan: CleaningPlan,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Preview cleaning operations without applying them"""
    
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
    
    file_extension = f".{dataset.file_type.value}"
    safe_filename = f"{dataset_id}{file_extension}"
    file_path = STORAGE_DIR / safe_filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset file not found"
        )
    
    try:
        # Convert CleaningPlan operations to operations list
        operations = []
        if cleaning_plan.operations:
            for op in cleaning_plan.operations:
                operations.append({
                    "type": op.operation_type,
                    "params": op.parameters
                })
        
        # Apply operations (without saving)
        result = DataOperationsService.apply_operations(
            str(file_path),
            dataset.file_type.value,
            operations
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Failed to preview cleaning operations")
            )
        
        # Pop the dataframe from result (don't need to return it)
        result.pop("dataframe", None)
        
        return {
            "success": True,
            "preview": result,
            "message": "Preview generated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error previewing cleaning operations: {str(e)}"
        )
