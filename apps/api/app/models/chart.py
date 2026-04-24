# apps/api/app/models/chart.py
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import enum


class ChartType(str, enum.Enum):
    # Basic Charts (existing)
    LINE = "LINE"
    BAR = "BAR"
    AREA = "AREA"
    SCATTER = "SCATTER"
    
    # Distribution & Statistical
    PIE = "PIE"
    DONUT = "DONUT"
    HISTOGRAM = "HISTOGRAM"
    BOX = "BOX"
    
    # Metrics & KPIs
    KPI_CARD = "KPI_CARD"
    GAUGE = "GAUGE"
    
    # Mixed & Combined
    COMBO = "COMBO"
    
    # Hierarchical & Flow
    TREEMAP = "TREEMAP"
    WATERFALL = "WATERFALL"
    FUNNEL = "FUNNEL"
    
    # Advanced
    BUBBLE = "BUBBLE"
    HEATMAP = "HEATMAP"
    
    # Data Display
    TABLE = "TABLE"
    MATRIX = "MATRIX"


class Chart(BaseModel):
    __tablename__ = "charts"
    
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    dashboard_id = Column(UUID(as_uuid=True), ForeignKey("dashboards.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    chart_type = Column(Enum(ChartType, native_enum=False), nullable=False)
    config = Column(JSON, default=dict, nullable=False)  # Stores chart configuration
    
    def __repr__(self):
        return f"<Chart {self.name}>"
