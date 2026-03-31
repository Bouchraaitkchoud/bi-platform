# apps/api/app/api/relationships.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.database import get_db
from app.core.security import verify_token
from app.core.dependencies import get_current_user
from app.schemas.relationship import (
    RelationshipCreate, RelationshipResponse, RelationshipUpdate,
    MeasureCreate, MeasureResponse, MeasureUpdate,
    CalculatedColumnCreate, CalculatedColumnResponse, CalculatedColumnUpdate,
    HierarchyCreate, HierarchyResponse, HierarchyUpdate
)
from app.models.relationship import Relationship, Measure, CalculatedColumn, Hierarchy
from app.models.dataset import Dataset

router = APIRouter(prefix="/relationships", tags=["relationships"])
security = HTTPBearer()


async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract current user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims",
        )
    
    return {"user_id": user_id, "type": payload.get("type")}


# ========== RELATIONSHIPS ==========

@router.post("", response_model=RelationshipResponse, status_code=status.HTTP_201_CREATED)
async def create_relationship(
    relationship: RelationshipCreate,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Create a new relationship between datasets"""
    try:
        # Verify both datasets exist and belong to user
        stmt1 = select(Dataset).where(
            (Dataset.id == relationship.from_dataset_id) & 
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        stmt2 = select(Dataset).where(
            (Dataset.id == relationship.to_dataset_id) & 
            (Dataset.user_id == UUID(current_user["user_id"]))
        )
        
        result1 = await session.execute(stmt1)
        result2 = await session.execute(stmt2)
        
        if not result1.scalar() or not result2.scalar():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or both datasets not found",
            )
        
        db_relationship = Relationship(
            **relationship.dict(),
            user_id=UUID(current_user["user_id"])
        )
        session.add(db_relationship)
        await session.commit()
        await session.refresh(db_relationship)
        
        return db_relationship
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=list[RelationshipResponse])
async def list_relationships(
    dataset_id: UUID = None,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """List relationships for a dataset"""
    query = select(Relationship).where(
        Relationship.user_id == UUID(current_user["user_id"])
    )
    
    if dataset_id:
        from sqlalchemy import or_
        query = query.where(
            or_(
                Relationship.from_dataset_id == dataset_id,
                Relationship.to_dataset_id == dataset_id
            )
        )
    
    result = await session.execute(query)
    return result.scalars().all()


@router.get("/{relationship_id}", response_model=RelationshipResponse)
async def get_relationship(
    relationship_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Get a specific relationship"""
    stmt = select(Relationship).where(
        (Relationship.id == relationship_id) &
        (Relationship.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    relationship = result.scalar()
    
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found",
        )
    
    return relationship


@router.put("/{relationship_id}", response_model=RelationshipResponse)
async def update_relationship(
    relationship_id: UUID,
    relationship_update: RelationshipUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Update a relationship"""
    stmt = select(Relationship).where(
        (Relationship.id == relationship_id) &
        (Relationship.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    db_relationship = result.scalar()
    
    if not db_relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found",
        )
    
    update_data = relationship_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_relationship, key, value)
    
    await session.commit()
    await session.refresh(db_relationship)
    
    return db_relationship


@router.delete("/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_relationship(
    relationship_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Delete a relationship"""
    stmt = select(Relationship).where(
        (Relationship.id == relationship_id) &
        (Relationship.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    db_relationship = result.scalar()
    
    if not db_relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found",
        )
    
    await session.delete(db_relationship)
    await session.commit()


# ========== MEASURES (using same router) ==========

measure_router = APIRouter(prefix="/measures", tags=["measures"])


@measure_router.post("", response_model=MeasureResponse, status_code=status.HTTP_201_CREATED)
async def create_measure(
    measure: MeasureCreate,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Create a new measure"""
    # Verify dataset exists
    stmt = select(Dataset).where(
        (Dataset.id == measure.dataset_id) &
        (Dataset.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    if not result.scalar():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found",
        )
    
    db_measure = Measure(
        **measure.dict(),
        user_id=UUID(current_user["user_id"]),
        formula_display=measure.formula  # Can be enhanced with formatting
    )
    session.add(db_measure)
    await session.commit()
    await session.refresh(db_measure)
    
    return db_measure


@measure_router.get("", response_model=list[MeasureResponse])
async def list_measures(
    dataset_id: UUID = None,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """List measures"""
    query = select(Measure).where(
        Measure.user_id == UUID(current_user["user_id"])
    )
    
    if dataset_id:
        query = query.where(Measure.dataset_id == dataset_id)
    
    result = await session.execute(query)
    return result.scalars().all()


@measure_router.put("/{measure_id}", response_model=MeasureResponse)
async def update_measure(
    measure_id: UUID,
    measure_update: MeasureUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Update a measure"""
    stmt = select(Measure).where(
        (Measure.id == measure_id) &
        (Measure.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    db_measure = result.scalar()
    
    if not db_measure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measure not found",
        )
    
    update_data = measure_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_measure, key, value)
    
    await session.commit()
    await session.refresh(db_measure)
    
    return db_measure


@measure_router.delete("/{measure_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_measure(
    measure_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Delete a measure"""
    stmt = select(Measure).where(
        (Measure.id == measure_id) &
        (Measure.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    db_measure = result.scalar()
    
    if not db_measure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Measure not found",
        )
    
    await session.delete(db_measure)
    await session.commit()


# ========== CALCULATED COLUMNS ==========

column_router = APIRouter(prefix="/calculated-columns", tags=["calculated-columns"])


@column_router.post("", response_model=CalculatedColumnResponse, status_code=status.HTTP_201_CREATED)
async def create_calculated_column(
    column: CalculatedColumnCreate,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Create a new calculated column"""
    stmt = select(Dataset).where(
        (Dataset.id == column.dataset_id) &
        (Dataset.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    if not result.scalar():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found",
        )
    
    db_column = CalculatedColumn(
        **column.dict(),
        user_id=UUID(current_user["user_id"])
    )
    session.add(db_column)
    await session.commit()
    await session.refresh(db_column)
    
    return db_column


@column_router.get("", response_model=list[CalculatedColumnResponse])
async def list_calculated_columns(
    dataset_id: UUID = None,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """List calculated columns"""
    query = select(CalculatedColumn).where(
        CalculatedColumn.user_id == UUID(current_user["user_id"])
    )
    
    if dataset_id:
        query = query.where(CalculatedColumn.dataset_id == dataset_id)
    
    result = await session.execute(query)
    return result.scalars().all()


@column_router.delete("/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_calculated_column(
    column_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Delete a calculated column"""
    stmt = select(CalculatedColumn).where(
        (CalculatedColumn.id == column_id) &
        (CalculatedColumn.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    db_column = result.scalar()
    
    if not db_column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculated column not found",
        )
    
    await session.delete(db_column)
    await session.commit()


# ========== HIERARCHIES ==========

hierarchy_router = APIRouter(prefix="/hierarchies", tags=["hierarchies"])


@hierarchy_router.post("", response_model=HierarchyResponse, status_code=status.HTTP_201_CREATED)
async def create_hierarchy(
    hierarchy: HierarchyCreate,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Create a new hierarchy"""
    stmt = select(Dataset).where(
        (Dataset.id == hierarchy.dataset_id) &
        (Dataset.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    if not result.scalar():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found",
        )
    
    db_hierarchy = Hierarchy(
        **hierarchy.dict(),
        user_id=UUID(current_user["user_id"])
    )
    session.add(db_hierarchy)
    await session.commit()
    await session.refresh(db_hierarchy)
    
    return db_hierarchy


@hierarchy_router.get("", response_model=list[HierarchyResponse])
async def list_hierarchies(
    dataset_id: UUID = None,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """List hierarchies"""
    query = select(Hierarchy).where(
        Hierarchy.user_id == UUID(current_user["user_id"])
    )
    
    if dataset_id:
        query = query.where(Hierarchy.dataset_id == dataset_id)
    
    result = await session.execute(query)
    return result.scalars().all()


@hierarchy_router.delete("/{hierarchy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hierarchy(
    hierarchy_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_from_token),
):
    """Delete a hierarchy"""
    stmt = select(Hierarchy).where(
        (Hierarchy.id == hierarchy_id) &
        (Hierarchy.user_id == UUID(current_user["user_id"]))
    )
    result = await session.execute(stmt)
    db_hierarchy = result.scalar()
    
    if not db_hierarchy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hierarchy not found",
        )
    
    await session.delete(db_hierarchy)
    await session.commit()


# Include sub-routers
router.include_router(measure_router)
router.include_router(column_router)
router.include_router(hierarchy_router)
