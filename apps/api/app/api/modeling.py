from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.relationship import Measure, CalculatedColumn, Hierarchy
from app.models.dataset import Dataset
from app.schemas.relationship import (
    MeasureCreate, MeasureResponse,
    CalculatedColumnCreate, CalculatedColumnResponse,
    HierarchyCreate, HierarchyResponse
)

router = APIRouter(prefix="", tags=["modeling"])


# ============= MEASURES =============

@router.get("/measures")
async def list_measures(
    dataset_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all measures for a dataset"""
    try:
        dataset_uuid = UUID(dataset_id)
        
        # Check dataset belongs to user
        stmt = select(Dataset).where(
            (Dataset.id == dataset_uuid) &
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        # Get measures
        stmt = select(Measure).where(Measure.dataset_id == dataset_uuid)
        result = await db.execute(stmt)
        measures = result.scalars().all()
        
        return [{
            "id": str(m.id),
            "dataset_id": str(m.dataset_id),
            "user_id": str(m.user_id),
            "name": m.name,
            "formula": m.formula,
            "formula_display": m.formula_display,
            "data_type": str(m.data_type),
            "description": m.description,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "updated_at": m.updated_at.isoformat() if m.updated_at else None,
        } for m in measures]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid dataset ID format"
        )


@router.post("/measures", status_code=status.HTTP_201_CREATED)
async def create_measure(
    measure_data: MeasureCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new measure"""
    try:
        dataset_id = measure_data.dataset_id
        
        # Check dataset belongs to user
        stmt = select(Dataset).where(
            (Dataset.id == dataset_id) &
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        measure = Measure(
            dataset_id=dataset_id,
            user_id=UUID(current_user["user_id"]),
            name=measure_data.name,
            formula=measure_data.formula,
            formula_display=measure_data.formula,
            data_type=measure_data.data_type,
            description=measure_data.description,
        )
        
        db.add(measure)
        await db.commit()
        await db.refresh(measure)
        
        return {
            "id": str(measure.id),
            "dataset_id": str(measure.dataset_id),
            "user_id": str(measure.user_id),
            "name": measure.name,
            "formula": measure.formula,
            "formula_display": measure.formula_display,
            "data_type": str(measure.data_type),
            "description": measure.description,
            "created_at": measure.created_at.isoformat() if hasattr(measure, 'created_at') else None,
            "updated_at": measure.updated_at.isoformat() if hasattr(measure, 'updated_at') else None,
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request data: {str(e)}"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )


@router.delete("/measures/{measure_id}")
async def delete_measure(
    measure_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a measure"""
    try:
        measure_uuid = UUID(measure_id)
        
        stmt = select(Measure).where(Measure.id == measure_uuid)
        result = await db.execute(stmt)
        measure = result.scalar_one_or_none()
        
        if not measure:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Measure not found"
            )
        
        # Check ownership through dataset
        stmt = select(Dataset).where(
            (Dataset.id == measure.dataset_id) &
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
        
        await db.delete(measure)
        await db.commit()
        
        return {"success": True}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid measure ID format"
        )


# ============= CALCULATED COLUMNS =============

@router.get("/calculated-columns")
async def list_calculated_columns(
    dataset_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all calculated columns for a dataset"""
    try:
        dataset_uuid = UUID(dataset_id)
        
        # Check dataset belongs to user
        stmt = select(Dataset).where(
            (Dataset.id == dataset_uuid) &
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        stmt = select(CalculatedColumn).where(CalculatedColumn.dataset_id == dataset_uuid)
        result = await db.execute(stmt)
        columns = result.scalars().all()
        
        return [{
            "id": str(c.id),
            "dataset_id": str(c.dataset_id),
            "user_id": str(c.user_id),
            "column_name": c.column_name,
            "formula": c.formula,
            "data_type": str(c.data_type),
            "description": c.description,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        } for c in columns]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid dataset ID format"
        )


@router.post("/calculated-columns", status_code=status.HTTP_201_CREATED)
async def create_calculated_column(
    column_data: CalculatedColumnCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new calculated column"""
    try:
        dataset_id = column_data.dataset_id
        
        # Check dataset belongs to user
        stmt = select(Dataset).where(
            (Dataset.id == dataset_id) &
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        column = CalculatedColumn(
            dataset_id=dataset_id,
            user_id=UUID(current_user["user_id"]),
            column_name=column_data.column_name,
            formula=column_data.formula,
            data_type=column_data.data_type,
            description=column_data.description,
        )
        
        db.add(column)
        await db.commit()
        await db.refresh(column)
        
        return {
            "id": str(column.id),
            "dataset_id": str(column.dataset_id),
            "user_id": str(column.user_id),
            "column_name": column.column_name,
            "formula": column.formula,
            "data_type": str(column.data_type),
            "description": column.description,
            "created_at": column.created_at.isoformat() if hasattr(column, 'created_at') else None,
            "updated_at": column.updated_at.isoformat() if hasattr(column, 'updated_at') else None,
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request data"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/calculated-columns/{column_id}")
async def delete_calculated_column(
    column_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a calculated column"""
    try:
        column_uuid = UUID(column_id)
        
        stmt = select(CalculatedColumn).where(CalculatedColumn.id == column_uuid)
        result = await db.execute(stmt)
        column = result.scalar_one_or_none()
        
        if not column:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Calculated column not found"
            )
        
        # Check ownership through dataset
        stmt = select(Dataset).where(
            (Dataset.id == column.dataset_id) &
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
        
        await db.delete(column)
        await db.commit()
        
        return {"success": True}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid column ID format"
        )


# ============= HIERARCHIES =============

@router.get("/hierarchies")
async def list_hierarchies(
    dataset_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all hierarchies for a dataset"""
    try:
        dataset_uuid = UUID(dataset_id)
        
        # Check dataset belongs to user
        stmt = select(Dataset).where(
            (Dataset.id == dataset_uuid) &
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        stmt = select(Hierarchy).where(Hierarchy.dataset_id == dataset_uuid)
        result = await db.execute(stmt)
        hierarchies = result.scalars().all()
        
        return [{
            "id": str(h.id),
            "dataset_id": str(h.dataset_id),
            "user_id": str(h.user_id),
            "name": h.name,
            "hierarchy_type": str(h.hierarchy_type),
            "columns": h.columns or [],
            "created_at": h.created_at.isoformat() if h.created_at else None,
            "updated_at": h.updated_at.isoformat() if h.updated_at else None,
        } for h in hierarchies]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid dataset ID format"
        )


@router.post("/hierarchies", status_code=status.HTTP_201_CREATED)
async def create_hierarchy(
    hierarchy_data: HierarchyCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new hierarchy"""
    try:
        dataset_id = hierarchy_data.dataset_id
        
        # Check dataset belongs to user
        stmt = select(Dataset).where(
            (Dataset.id == dataset_id) &
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        dataset = result.scalar_one_or_none()
        
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        hierarchy = Hierarchy(
            dataset_id=dataset_id,
            user_id=UUID(current_user["user_id"]),
            name=hierarchy_data.name,
            hierarchy_type=hierarchy_data.hierarchy_type,
            columns=hierarchy_data.columns,
        )
        
        db.add(hierarchy)
        await db.commit()
        await db.refresh(hierarchy)
        
        return {
            "id": str(hierarchy.id),
            "dataset_id": str(hierarchy.dataset_id),
            "user_id": str(hierarchy.user_id),
            "name": hierarchy.name,
            "hierarchy_type": str(hierarchy.hierarchy_type),
            "columns": hierarchy.columns or [],
            "created_at": hierarchy.created_at.isoformat() if hasattr(hierarchy, 'created_at') else None,
            "updated_at": hierarchy.updated_at.isoformat() if hasattr(hierarchy, 'updated_at') else None,
        }
    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request data"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/hierarchies/{hierarchy_id}")
async def delete_hierarchy(
    hierarchy_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a hierarchy"""
    try:
        hierarchy_uuid = UUID(hierarchy_id)
        
        stmt = select(Hierarchy).where(Hierarchy.id == hierarchy_uuid)
        result = await db.execute(stmt)
        hierarchy = result.scalar_one_or_none()
        
        if not hierarchy:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hierarchy not found"
            )
        
        # Check ownership through dataset
        stmt = select(Dataset).where(
            (Dataset.id == hierarchy.dataset_id) &
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
        
        await db.delete(hierarchy)
        await db.commit()
        
        return {"success": True}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid hierarchy ID format"
        )
