# apps/api/app/schemas/relationship.py
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


class RelationshipBase(BaseModel):
    from_dataset_id: UUID
    to_dataset_id: UUID
    from_column: str
    to_column: str
    cardinality: Literal["1:1", "1:*", "*:1", "*:*"]  # One-to-one, One-to-many, etc.
    direction: Literal["single", "both"] = "single"


class RelationshipCreate(RelationshipBase):
    pass


class RelationshipUpdate(BaseModel):
    cardinality: Optional[Literal["1:1", "1:*", "*:1", "*:*"]] = None
    direction: Optional[Literal["single", "both"]] = None
    is_active: Optional[bool] = None


class RelationshipResponse(RelationshipBase):
    id: UUID
    user_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MeasureBase(BaseModel):
    dataset_id: UUID
    name: str
    description: Optional[str] = None
    formula: str  # DAX-like formula
    data_type: str  # "number", "currency", "percentage", "text", "date"


class MeasureCreate(MeasureBase):
    pass


class MeasureUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    formula: Optional[str] = None
    data_type: Optional[str] = None


class MeasureResponse(MeasureBase):
    id: UUID
    user_id: UUID
    formula_display: str  # Formatted version of formula
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CalculatedColumnBase(BaseModel):
    dataset_id: UUID
    column_name: str
    description: Optional[str] = None
    formula: str  # DAX-like formula
    data_type: str


class CalculatedColumnCreate(CalculatedColumnBase):
    pass


class CalculatedColumnUpdate(BaseModel):
    column_name: Optional[str] = None
    description: Optional[str] = None
    formula: Optional[str] = None
    data_type: Optional[str] = None


class CalculatedColumnResponse(CalculatedColumnBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class HierarchyBase(BaseModel):
    dataset_id: UUID
    name: str
    description: Optional[str] = None
    hierarchy_type: Literal["date", "geographic", "custom"]
    columns: list  # List of column names in order


class HierarchyCreate(HierarchyBase):
    pass


class HierarchyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    columns: Optional[list] = None


class HierarchyResponse(HierarchyBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
