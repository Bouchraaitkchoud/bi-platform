# apps/api/app/models/chart.py
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import enum


class ChartType(str, enum.Enum):
    LINE = "line"
    BAR = "bar"
    PIE = "pie"
    SCATTER = "scatter"
    AREA = "area"
    HISTOGRAM = "histogram"
    BOX = "box"
    TABLE = "table"


class Chart(BaseModel):
    __tablename__ = "charts"
    
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    chart_type = Column(Enum(ChartType), nullable=False)
    config = Column(JSON, default=dict)  # Stores chart configuration
    
    def __repr__(self):
        return f"<Chart {self.name}>"
