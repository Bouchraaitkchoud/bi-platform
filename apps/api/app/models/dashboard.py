# apps/api/app/models/dashboard.py
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from app.models.base import BaseModel


class Dashboard(BaseModel):
    __tablename__ = "dashboards"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    layout_config = Column(JSON, default=dict)  # Stores grid layout configuration
    chart_ids = Column(ARRAY(UUID), default=list)  # Array of chart UUIDs
    
    def __repr__(self):
        return f"<Dashboard {self.name}>"
