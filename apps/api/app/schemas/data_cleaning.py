# apps/api/app/schemas/data_cleaning.py
from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class ColumnAnalysis(BaseModel):
    """Column-level data quality analysis"""
    name: str
    data_type: str
    missing_count: int
    missing_percent: float
    unique_count: int
    sample_values: List[Any]


class DataQualityAnalysis(BaseModel):
    """Overall data quality metrics"""
    total_rows: int
    total_columns: int
    total_cells: int
    missing_cells: int
    missing_percent: float
    duplicate_rows: int
    columns: List[ColumnAnalysis]
    quality_score: float  # 0-100


class ColumnStatistics(BaseModel):
    """Detailed column statistics"""
    name: str
    data_type: str
    total_values: int
    missing_values: int
    duplicate_values: int
    unique_values: int
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    top_values: Dict[str, int]


class ColumnUpdate(BaseModel):
    """Update column properties"""
    name: Optional[str] = None
    data_type: Optional[str] = None


class CleaningOperation(BaseModel):
    """Represents a cleaning operation to apply"""
    operation_type: str  # "rename_column", "change_type", "remove_column", "remove_duplicates", etc.
    parameters: Dict[str, Any]  # Operation-specific parameters


class CleaningPlan(BaseModel):
    """Collection of cleaning operations"""
    operations: List[CleaningOperation] = []
    description: Optional[str] = None
    operations: List[CleaningOperation]
