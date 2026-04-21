# apps/api/app/models/transformation.py
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import enum


class TransformationOperation(str, enum.Enum):
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


class Transformation(BaseModel):
    """
    Stores a single transformation step in a replayable pipeline.
    Each step has a step_order and parameters to enable undo/redo via replay.
    """
    __tablename__ = "transformations"
    
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True)
    step_order = Column(Integer, nullable=False, index=True)  # Order of execution
    operation = Column(Enum(TransformationOperation, native_enum=False), nullable=False)
    parameters = Column(JSON, nullable=False, default=dict)  # Operation-specific parameters
    description = Column(Text, nullable=True)  # Human-readable description
    
    # Unique constraint: one dataset cannot have duplicate step_order values
    __table_args__ = (
        # Will add unique constraint in migration
    )
    
    # Relationships
    dataset = relationship("Dataset", back_populates="transformations")
    
    def __repr__(self):
        return f"<Transformation {self.dataset_id}:step_{self.step_order}>"
