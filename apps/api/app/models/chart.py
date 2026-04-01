# apps/api/app/models/chart.py
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import enum


class ChartType(str, enum.Enum):
    # Basic Charts (existing)
    LINE = "line"
    BAR = "bar"
    AREA = "area"
    SCATTER = "scatter"
    
    # Distribution & Statistical
    PIE = "pie"
    DONUT = "donut"
    HISTOGRAM = "histogram"
    BOX = "box"
    
    # Metrics & KPIs
    KPI_CARD = "kpi_card"  # Single metric display
    GAUGE = "gauge"  # Speedometer style gauge
    
    # Mixed & Combined
    COMBO = "combo"  # Line + Bar combined
    
    # Hierarchical & Flow
    TREEMAP = "treemap"  # Hierarchical rectangles
    WATERFALL = "waterfall"  # Sequential changes
    FUNNEL = "funnel"  # Funnel/conversion flow
    
    # Advanced
    BUBBLE = "bubble"  # Scatter with size dimension
    HEATMAP = "heatmap"  # Matrix with color intensity
    
    # Data Display
    TABLE = "table"
    MATRIX = "matrix"  # Pivot table with drill-down


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
