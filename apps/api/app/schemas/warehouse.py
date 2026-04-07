# apps/api/app/schemas/warehouse.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class DataTableCreate(BaseModel):
    name: str
    description: Optional[str] = None
    file_type: str = "CSV"


class DataTableResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    row_count: int
    column_count: int
    columns_metadata: Dict[str, Any]
    file_size: int
    is_processed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class WarehouseRelationshipCreate(BaseModel):
    from_table_name: str
    to_table_name: str
    from_column: str
    to_column: str
    cardinality: str = "1:*"
    join_type: str = "left"


class WarehouseRelationshipResponse(BaseModel):
    id: UUID
    from_table_name: str
    to_table_name: str
    from_column: str
    to_column: str
    cardinality: str
    join_type: str
    is_auto_detected: bool
    confidence_score: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class DataWarehouseCreate(BaseModel):
    name: str
    description: Optional[str] = None


class DataWarehouseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class DataWarehouseResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    tables: List[DataTableResponse] = []
    relationships: List[WarehouseRelationshipResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MultiFileUploadRequest(BaseModel):
    """Request body for uploading multiple CSV files"""
    warehouse_name: str
    warehouse_description: Optional[str] = None
    # Files are sent as multipart/form-data, not in JSON


class DataTableMetadata(BaseModel):
    """Metadata for a single table after import"""
    table_name: str
    file_name: str
    row_count: int
    column_count: int
    columns: Dict[str, Any]  # {col_name: {type, null_count, sample_values}}


class WarehouseImportResponse(BaseModel):
    """Response after importing multiple files"""
    warehouse_id: UUID
    warehouse_name: str
    tables: List[DataTableMetadata]
    relationships: List[WarehouseRelationshipResponse]
    message: str
