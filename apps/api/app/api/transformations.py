# apps/api/app/api/transformations.py
from fastapi import APIRouter, HTTPException, status, Depends, Body
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import uuid

from app.core.database import get_db
from app.core.security import verify_token
from app.models.dataset import Dataset
from app.models.transformation import Transformation, TransformationOperation
from app.schemas.transformation import TransformationCreate, TransformationResponse, TransformationPipeline
from app.services.data_operations_service import apply_cleaning_operations
from pathlib import Path

router = APIRouter(prefix="/datasets", tags=["transformations"])
security = HTTPBearer()

STORAGE_DIR = Path("storage/datasets").resolve()


async def get_current_user_from_token(token: str = Depends(security)):
    """Extract user from token"""
    payload = verify_token(token.credentials)
    
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


@router.post("/{dataset_id}/transformations", response_model=TransformationResponse, status_code=status.HTTP_201_CREATED)
async def save_transformation(
    dataset_id: uuid.UUID,
    transformation_data: TransformationCreate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Save a transformation step for a dataset"""
    
    # Verify dataset belongs to user
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
    
    try:
        # Get the next step order
        stmt = select(Transformation).where(
            Transformation.dataset_id == dataset_id
        ).order_by(desc(Transformation.step_order))
        
        result = await db.execute(stmt)
        last_transformation = result.first()
        next_step_order = (last_transformation[0].step_order + 1) if last_transformation else 0
        
        # Create new transformation
        db_transformation = Transformation(
            id=uuid.uuid4(),
            dataset_id=dataset_id,
            step_order=next_step_order,
            operation=transformation_data.operation,
            parameters=transformation_data.parameters,
            description=transformation_data.description
        )
        
        db.add(db_transformation)
        await db.commit()
        await db.refresh(db_transformation)
        
        return db_transformation
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving transformation: {str(e)}"
        )


@router.get("/{dataset_id}/transformations", response_model=TransformationPipeline)
async def get_transformations(
    dataset_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get all transformations for a dataset"""
    
    # Verify dataset belongs to user
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
    
    try:
        # Get all transformations ordered by step
        stmt = select(Transformation).where(
            Transformation.dataset_id == dataset_id
        ).order_by(Transformation.step_order)
        
        result = await db.execute(stmt)
        transformations = result.scalars().all()
        
        return {
            "transformations": transformations,
            "total_steps": len(transformations)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transformations: {str(e)}"
        )


@router.delete("/{dataset_id}/transformations/{step_order}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transformation(
    dataset_id: uuid.UUID,
    step_order: int,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Delete a transformation step (for undo)"""
    
    # Verify dataset belongs to user
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
    
    try:
        # Find and delete the transformation
        stmt = select(Transformation).where(
            (Transformation.dataset_id == dataset_id) &
            (Transformation.step_order == step_order)
        )
        
        result = await db.execute(stmt)
        transformation = result.scalar_one_or_none()
        
        if not transformation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transformation step not found"
            )
        
        # Delete the transformation
        await db.delete(transformation)
        
        # Reorder remaining steps
        stmt = select(Transformation).where(
            (Transformation.dataset_id == dataset_id) &
            (Transformation.step_order > step_order)
        ).order_by(Transformation.step_order)
        
        result = await db.execute(stmt)
        later_transformations = result.scalars().all()
        
        for trans in later_transformations:
            trans.step_order -= 1
        
        await db.commit()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting transformation: {str(e)}"
        )


@router.post("/{dataset_id}/transformations/apply-all")
async def apply_all_transformations(
    dataset_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Apply all saved transformations to the dataset file"""
    
    # Verify dataset belongs to user
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
    
    try:
        # Get all transformations in order
        stmt = select(Transformation).where(
            Transformation.dataset_id == dataset_id
        ).order_by(Transformation.step_order)
        
        result = await db.execute(stmt)
        transformations = result.scalars().all()
        
        if not transformations:
            return {
                "success": True,
                "message": "No transformations to apply",
                "transformations_applied": 0
            }
        
        # Build operations list
        operations = []
        for trans in transformations:
            operations.append({
                "operation": trans.operation.value,
                "parameters": trans.parameters
            })
        
        # Find the dataset file
        file_path = _find_dataset_file(dataset)
        
        if not file_path or not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset file not found"
            )
        
        # Apply all transformations
        result = await apply_cleaning_operations(
            str(dataset_id),
            str(file_path),
            dataset.file_type.value,
            operations,
            str(file_path)  # Overwrite the original
        )
        
        # Update dataset metadata
        dataset.row_count = result.get('row_count', dataset.row_count)
        dataset.column_count = result.get('column_count', dataset.column_count)
        dataset.columns_metadata = result.get('columns_metadata', dataset.columns_metadata)
        
        await db.commit()
        
        return {
            "success": True,
            "message": "All transformations applied successfully",
            "transformations_applied": len(transformations),
            "result": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error applying transformations: {str(e)}"
        )


def _find_dataset_file(dataset):
    """Helper to find dataset file using the same logic as in datasets.py"""
    file_path = None
    original_file = dataset.original_file
    
    # Try multiple path variations
    candidate = Path(original_file)
    if candidate.exists():
        return candidate
    
    if not candidate.is_absolute() and candidate.exists():
        return candidate.resolve()
    
    candidate = STORAGE_DIR / original_file.split('/')[-1]
    if candidate.exists():
        return candidate
    
    if '/' in original_file:
        filename = original_file.replace('storage/datasets/', '').replace('storage\\datasets\\', '')
        candidate = STORAGE_DIR / filename
        if candidate.exists():
            return candidate
    
    # Try with UUID + lowercase extension
    file_type_lower = dataset.file_type.value.lower()
    candidate = STORAGE_DIR / f"{dataset.id}.{file_type_lower}"
    if candidate.exists():
        return candidate
    
    # Try with UUID + uppercase extension
    file_type_upper = dataset.file_type.value.upper()
    candidate = STORAGE_DIR / f"{dataset.id}.{file_type_upper}"
    if candidate.exists():
        return candidate
    
    return None
