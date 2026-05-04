# apps/api/app/schemas/dataset.py
from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.dataset import SourceType, FileType


class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None


class DatasetCreate(DatasetBase):
    source_type: SourceType
    
    # File-based
    file_type: Optional[FileType] = None
    
    # DB-based
    db_connection_details: Optional[Dict[str, Any]] = None
    sql_query: Optional[str] = None

    @field_validator('file_type')
    def check_file_source(cls, v, info):
        if info.data.get('source_type') == SourceType.FILE and not v:
            raise ValueError('file_type is required for FILE source_type')
        return v

    @field_validator('db_connection_details', 'sql_query')
    def check_db_source(cls, v, info):
        if info.data.get('source_type') == SourceType.DATABASE:
            if info.field_name == 'sql_query' and not v:
                raise ValueError('sql_query is required for DATABASE source_type')
        return v


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    # You might want to add other updatable fields here, e.g., for the query
    sql_query: Optional[str] = None


class DatasetResponse(DatasetBase):
    id: UUID
    user_id: UUID
    source_type: SourceType
    
    # File-based
    original_file: Optional[str] = None
    file_type: Optional[FileType] = None
    
    # DB-based
    sql_query: Optional[str] = None
    
    row_count: int
    column_count: int
    columns_metadata: Dict[str, Any]
    file_size: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DatasetPreview(BaseModel):
    """Represents a preview of dataset data"""
    columns: list
    data: list
    row_count: int
    column_count: int


class DatabaseConnectionTest(BaseModel):
    """Test database connection request"""
    db_connection_details: Dict[str, Any]
    sql_query: str


class DatabaseConnectionDetails(BaseModel):
    db_type: str
    host: str
    port: int
    user: str
    password: str
    dbname: str


class ActiveDatabaseConnectionSet(BaseModel):
    db_connection_details: DatabaseConnectionDetails


class ActiveDatabaseConnectionResponse(BaseModel):
    db_connection_details: Dict[str, Any]


class DatabaseQueryRequest(BaseModel):
    sql_query: str


class DatabaseQueryHistoryResponse(BaseModel):
    items: list[str]


class DatabaseConnectionTestResponse(BaseModel):
    """Test database connection response"""
    message: str
    preview_data: Dict[str, Any]
