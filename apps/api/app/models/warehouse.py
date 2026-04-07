# apps/api/app/models/warehouse.py
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text, Enum, Boolean, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import enum


# Association table for many-to-many relationship between DataWarehouse and DataTable
warehouse_tables = Table(
    'warehouse_tables',
    BaseModel.metadata,
    Column('warehouse_id', UUID(as_uuid=True), ForeignKey('data_warehouses.id', ondelete='CASCADE'), primary_key=True),
    Column('table_id', UUID(as_uuid=True), ForeignKey('data_tables.id', ondelete='CASCADE'), primary_key=True)
)


class DataTable(BaseModel):
    """Represents a single table within a data warehouse"""
    __tablename__ = "data_tables"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)  # TableName like "asia_fuel_prices_detailed"
    description = Column(Text, nullable=True)
    original_file = Column(String(500), nullable=False)  # Path to CSV
    file_type = Column(String(50), default="CSV")
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    columns_metadata = Column(JSON, default=dict)  # Stores column info: {col_name: {type, null_count, sample_values}}
    file_size = Column(Integer, default=0)
    is_processed = Column(Boolean, default=False)  # Whether imported and cleaned
    
    # Relationships
    warehouses = relationship(
        "DataWarehouse",
        secondary=warehouse_tables,
        back_populates="tables",
        cascade="all"
    )
    
    def __repr__(self):
        return f"<DataTable {self.name}>"


class DataWarehouse(BaseModel):
    """Groups multiple related tables together"""
    __tablename__ = "data_warehouses"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)  # e.g., "Fuel Markets Analysis"
    description = Column(Text, nullable=True)
    
    # Relationships
    tables = relationship(
        "DataTable",
        secondary=warehouse_tables,
        back_populates="warehouses", 
        cascade="all"
    )
    
    relationships = relationship("WarehouseRelationship", back_populates="warehouse", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DataWarehouse {self.name}>"


class WarehouseRelationship(BaseModel):
    """Defines relationships between tables in a warehouse"""
    __tablename__ = "warehouse_relationships"
    
    warehouse_id = Column(UUID(as_uuid=True), ForeignKey("data_warehouses.id"), nullable=False, index=True)
    
    # Tables involved
    from_table_name = Column(String(255), nullable=False)  # e.g., "asia_fuel_prices_detailed"
    to_table_name = Column(String(255), nullable=False)    # e.g., "price_trend_monthly"
    
    # Columns involved in the join
    from_column = Column(String(255), nullable=False)  # e.g., "country"
    to_column = Column(String(255), nullable=False)    # e.g., "country"
    
    # Relationship type
    cardinality = Column(String(50), default="1:*")  # 1:1, 1:*, *:1, *:*
    join_type = Column(String(50), default="left")   # left, right, inner, outer
    is_auto_detected = Column(Boolean, default=True)  # Whether created automatically
    confidence_score = Column(Integer, default=100)  # 0-100, lower for weaker matches
    
    # Relationships
    warehouse = relationship("DataWarehouse", back_populates="relationships")
    
    def __repr__(self):
        return f"<WarehouseRelationship {self.from_table_name}.{self.from_column} -> {self.to_table_name}.{self.to_column}>"
