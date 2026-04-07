# apps/api/app/api/warehouse.py
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import uuid
from typing import List
import pandas as pd
import io
from datetime import datetime

from app.core.database import get_db
from app.core.security import verify_token
from app.core.dependencies import get_current_user
from app.schemas.warehouse import (
    DataWarehouseCreate, DataWarehouseResponse, DataWarehouseUpdate,
    WarehouseImportResponse, DataTableMetadata
)
from app.models.warehouse import DataWarehouse, DataTable, WarehouseRelationship, warehouse_tables
from app.models.user import User
from app.services.warehouse_service import WarehouseService

router = APIRouter(prefix="/warehouses", tags=["warehouses"])


@router.post("/import-multi", response_model=WarehouseImportResponse)
async def import_multiple_csv_files(
    warehouse_name: str = Form(...),
    warehouse_description: str = Form(default=""),
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Import multiple CSV files as a single data warehouse"""
    
    try:
        current_user_id = uuid.UUID(current_user["user_id"])
        
        # Validate files
        valid, errors = WarehouseService.validate_csv_files(files)
        if not valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid files: {', '.join(errors)}"
            )
        
        # Read all CSV files into dataframes
        tables_dict = {}
        tables_metadata = []
        
        for file in files:
            try:
                # Read CSV
                contents = await file.read()
                df = pd.read_csv(io.BytesIO(contents))
                
                # Extract table name from filename
                table_name = WarehouseService.extract_table_name_from_filename(file.filename)
                
                # Get metadata
                metadata = WarehouseService.get_dataframe_metadata(df, table_name)
                
                tables_dict[table_name] = df
                tables_metadata.append({
                    "table_name": table_name,
                    "file_name": file.filename,
                    "row_count": metadata["row_count"],
                    "column_count": metadata["column_count"],
                    "columns": metadata["columns"]
                })
                
                # Reset file pointer
                await file.seek(0)
                
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error processing {file.filename}: {str(e)}"
                )
        
        # Auto-detect relationships between tables
        detected_relationships = WarehouseService.detect_relationships(tables_dict)
        
        # Create the warehouse
        warehouse = DataWarehouse(
            id=uuid.uuid4(),
            user_id=current_user_id,
            name=warehouse_name,
            description=warehouse_description if warehouse_description else None,
            created_at=datetime.utcnow()
        )
        db.add(warehouse)
        await db.flush()  # Flush warehouse to database so FK references work
        
        # Create data tables
        created_tables = []
        warehouse_id = warehouse.id
        
        for table_meta in tables_metadata:
            table_id = uuid.uuid4()
            data_table = DataTable(
                id=table_id,
                user_id=current_user_id,
                name=table_meta["table_name"],
                original_file=f"warehouse/{warehouse_id}/{table_meta['file_name']}",
                file_type="CSV",
                row_count=table_meta["row_count"],
                column_count=table_meta["column_count"],
                columns_metadata=table_meta["columns"],
                is_processed=True,
                created_at=datetime.utcnow()
            )
            created_tables.append(data_table)
            db.add(data_table)
        
        await db.flush()  # Flush tables to database before junction table inserts
        
        # Create relationships
        relationship_responses = []
        now = datetime.utcnow()
        
        for rel in detected_relationships:
            relationship = WarehouseRelationship(
                id=uuid.uuid4(),
                warehouse_id=warehouse_id,
                from_table_name=rel["from_table_name"],
                to_table_name=rel["to_table_name"],
                from_column=rel["from_column"],
                to_column=rel["to_column"],
                cardinality=rel["cardinality"],
                join_type=rel["join_type"],
                is_auto_detected=rel["is_auto_detected"],
                confidence_score=rel["confidence_score"],
                created_at=now
            )
            db.add(relationship)
            relationship_responses.append({
                "id": relationship.id,
                "from_table_name": relationship.from_table_name,
                "to_table_name": relationship.to_table_name,
                "from_column": relationship.from_column,
                "to_column": relationship.to_column,
                "cardinality": relationship.cardinality,
                "join_type": relationship.join_type,
                "is_auto_detected": relationship.is_auto_detected,
                "confidence_score": relationship.confidence_score,
                "created_at": now
            })
        
        # Add junction table entries for many-to-many relationship
        for table in created_tables:
            stmt = warehouse_tables.insert().values(
                warehouse_id=warehouse_id,
                table_id=table.id
            )
            await db.execute(stmt)
        
        # Commit all changes
        await db.commit()
        
        return {
            "warehouse_id": warehouse.id,
            "warehouse_name": warehouse.name,
            "tables": tables_metadata,
            "relationships": relationship_responses,
            "message": f"Successfully imported {len(created_tables)} tables with {len(detected_relationships)} auto-detected relationships"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error importing warehouse: {str(e)}"
        )

@router.get("/{warehouse_id}", response_model=DataWarehouseResponse)
async def get_warehouse(
    warehouse_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get warehouse details with all tables and relationships"""
    
    try:
        warehouse_uuid = uuid.UUID(warehouse_id)
        current_user_id = uuid.UUID(current_user["user_id"])
        
        stmt = select(DataWarehouse).where(
            (DataWarehouse.id == warehouse_uuid) &
            (DataWarehouse.user_id == current_user_id)
        ).options(
            selectinload(DataWarehouse.tables),
            selectinload(DataWarehouse.relationships)
        )
        result = await db.execute(stmt)
        warehouse = result.scalar_one_or_none()
        
        if not warehouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Warehouse not found"
            )
        
        return warehouse
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid warehouse ID"
        )


@router.get("/", response_model=List[DataWarehouseResponse])
async def list_warehouses(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """List all warehouses for the current user"""
    
    current_user_id = uuid.UUID(current_user["user_id"])
    
    stmt = select(DataWarehouse).where(
        DataWarehouse.user_id == current_user_id
    ).options(
        selectinload(DataWarehouse.tables),
        selectinload(DataWarehouse.relationships)
    ).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    warehouses = result.scalars().all()
    
    return warehouses


@router.put("/{warehouse_id}", response_model=DataWarehouseResponse)
async def update_warehouse(
    warehouse_id: str,
    update_data: DataWarehouseUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update warehouse information"""
    
    try:
        warehouse_uuid = uuid.UUID(warehouse_id)
        current_user_id = uuid.UUID(current_user["user_id"])
        
        stmt = select(DataWarehouse).where(
            (DataWarehouse.id == warehouse_uuid) &
            (DataWarehouse.user_id == current_user_id)
        )
        result = await db.execute(stmt)
        warehouse = result.scalar_one_or_none()
        
        if not warehouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Warehouse not found"
            )
        
        if update_data.name:
            warehouse.name = update_data.name
        if update_data.description:
            warehouse.description = update_data.description
        
        await db.commit()
        await db.refresh(warehouse)
        
        return warehouse
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid warehouse ID"
        )


@router.delete("/{warehouse_id}")
async def delete_warehouse(
    warehouse_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a warehouse and all its tables"""
    
    try:
        warehouse_uuid = uuid.UUID(warehouse_id)
        current_user_id = uuid.UUID(current_user["user_id"])
        
        stmt = select(DataWarehouse).where(
            (DataWarehouse.id == warehouse_uuid) &
            (DataWarehouse.user_id == current_user_id)
        )
        result = await db.execute(stmt)
        warehouse = result.scalar_one_or_none()
        
        if not warehouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Warehouse not found"
            )
        
        await db.delete(warehouse)
        await db.commit()
        
        return {"message": "Warehouse deleted successfully"}
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid warehouse ID"
        )
