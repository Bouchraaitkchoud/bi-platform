# apps/api/app/models/relationship.py
from sqlalchemy import Column, String, ForeignKey, Boolean, Enum, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class CardinalityType(str, enum.Enum):
    ONE_TO_ONE = "1:1"
    ONE_TO_MANY = "1:*"
    MANY_TO_ONE = "*:1"
    MANY_TO_MANY = "*:*"


class RelationshipDirection(str, enum.Enum):
    SINGLE = "single"
    BOTH = "both"


class Relationship(BaseModel):
    __tablename__ = "relationships"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    from_dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True)
    to_dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True)
    from_column = Column(String(255), nullable=False)
    to_column = Column(String(255), nullable=False)
    cardinality = Column(Enum(CardinalityType), default=CardinalityType.ONE_TO_MANY)
    direction = Column(Enum(RelationshipDirection), default=RelationshipDirection.SINGLE)
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<Relationship {self.from_dataset_id} -> {self.to_dataset_id}>"


class DataType(str, enum.Enum):
    NUMBER = "number"
    CURRENCY = "currency"
    PERCENTAGE = "percentage"
    TEXT = "text"
    DATE = "date"
    DATETIME = "datetime"
    BOOLEAN = "boolean"


class Measure(BaseModel):
    __tablename__ = "measures"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    formula = Column(Text, nullable=False)  # DAX-like formula
    formula_display = Column(Text, nullable=True)  # Formatted for display
    data_type = Column(Enum(DataType), default=DataType.NUMBER)
    
    # Relationships
    dataset = relationship("Dataset", back_populates="measures")
    
    def __repr__(self):
        return f"<Measure {self.name}>"


class CalculatedColumn(BaseModel):
    __tablename__ = "calculated_columns"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True)
    column_name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    formula = Column(Text, nullable=False)  # DAX-like formula
    data_type = Column(Enum(DataType), default=DataType.TEXT)
    
    # Relationships
    dataset = relationship("Dataset", back_populates="calculated_columns")
    
    def __repr__(self):
        return f"<CalculatedColumn {self.column_name}>"


class HierarchyType(str, enum.Enum):
    DATE = "date"
    GEOGRAPHIC = "geographic"
    CUSTOM = "custom"


class Hierarchy(BaseModel):
    __tablename__ = "hierarchies"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    hierarchy_type = Column(Enum(HierarchyType), default=HierarchyType.CUSTOM)
    columns = Column(JSON, default=list)  # Ordered list of column names
    
    # Relationships
    dataset = relationship("Dataset", back_populates="hierarchies")
    
    def __repr__(self):
        return f"<Hierarchy {self.name}>"
