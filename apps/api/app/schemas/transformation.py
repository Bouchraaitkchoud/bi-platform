# apps/api/app/schemas/transformation.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from enum import Enum


class TransformationOperation(str, Enum):
    """Supported data cleaning operations"""
    DROP_NULLS = "DROP_NULLS"
    DROP_DUPLICATES = "DROP_DUPLICATES"
    RENAME_COLUMN = "RENAME_COLUMN"
    CAST_TYPE = "CAST_TYPE"
    FILTER_ROWS = "FILTER_ROWS"
    DROP_COLUMN = "DROP_COLUMN"
    COMPUTED_COLUMN = "COMPUTED_COLUMN"
    FILL_MISSING = "FILL_MISSING"
    SPLIT_COLUMN = "SPLIT_COLUMN"
    MERGE_COLUMNS = "MERGE_COLUMNS"
    UPPERCASE = "UPPERCASE"
    LOWERCASE = "LOWERCASE"
    TRIM_WHITESPACE = "TRIM_WHITESPACE"


class TransformationCreate(BaseModel):
    """Schema for creating a transformation"""
    operation: TransformationOperation
    parameters: Dict[str, Any] = Field(default_factory=dict)
    description: Optional[str] = None


class TransformationUpdate(BaseModel):
    """Schema for updating a transformation"""
    operation: Optional[TransformationOperation] = None
    parameters: Optional[Dict[str, Any]] = None
    description: Optional[str] = None


class TransformationResponse(TransformationCreate):
    """Schema for returning transformation"""
    id: UUID
    dataset_id: UUID
    step_order: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TransformationPipeline(BaseModel):
    """Schema for full transformation pipeline"""
    transformations: list[TransformationResponse]
    total_steps: int


class ApplyTransformationRequest(BaseModel):
    """Request to apply transformations up to a specific step"""
    step_order: int  # Apply transformations from 0 to step_order (inclusive)


class UndoRedoRequest(BaseModel):
    """Request for undo/redo operations"""
    target_step: int  # Target step to replay to (0 = all removed)
