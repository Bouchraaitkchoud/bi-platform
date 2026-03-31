# apps/api/app/schemas/dashboard.py
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class DashboardBase(BaseModel):
    name: str
    description: Optional[str] = None


class DashboardCreate(DashboardBase):
    layout_config: Optional[Dict[str, Any]] = {}
    chart_ids: Optional[List[UUID]] = []


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout_config: Optional[Dict[str, Any]] = None
    chart_ids: Optional[List[UUID]] = None


class DashboardResponse(DashboardBase):
    id: UUID
    user_id: UUID
    layout_config: Dict[str, Any]
    chart_ids: List[UUID]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
