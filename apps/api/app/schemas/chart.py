# apps/api/app/schemas/chart.py
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class ChartBase(BaseModel):
    name: str
    description: Optional[str] = None
    chart_type: str


class ChartCreate(ChartBase):
    dataset_id: UUID
    config: Dict[str, Any] = {}


class ChartUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class ChartDataRequest(BaseModel):
    dimensions: Optional[List[str]] = None
    measures: Optional[List[str]] = None


class ChartResponse(ChartBase):
    id: UUID
    dataset_id: UUID
    user_id: UUID
    config: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
