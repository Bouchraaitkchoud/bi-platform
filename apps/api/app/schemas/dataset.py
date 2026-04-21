# apps/api/app/schemas/dataset.py
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None


class DatasetCreate(DatasetBase):
    file_type: str


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class DatasetResponse(DatasetBase):
    id: UUID
    user_id: UUID
    original_file: str
    file_type: str
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
