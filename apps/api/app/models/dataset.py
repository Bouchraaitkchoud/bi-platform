# apps/api/app/models/dataset.py
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
import enum


class FileType(str, enum.Enum):
    CSV = "CSV"
    XLSX = "XLSX"
    XLS = "XLS"
    JSON = "JSON"


class DatasetStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"


class Dataset(BaseModel):
    __tablename__ = "datasets"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    original_file = Column(String(500), nullable=False)
    file_type = Column(Enum(FileType), nullable=False)
    status = Column(Enum(DatasetStatus, native_enum=False), nullable=False, default=DatasetStatus.UPLOADED)
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    columns_metadata = Column(JSON, default=dict)  # Stores column info like types, null counts, etc.
    file_size = Column(Integer, default=0)  # Size in bytes
    
    # Relationships
    measures = relationship("Measure", back_populates="dataset", cascade="all, delete-orphan")
    calculated_columns = relationship("CalculatedColumn", back_populates="dataset", cascade="all, delete-orphan")
    hierarchies = relationship("Hierarchy", back_populates="dataset", cascade="all, delete-orphan")
    transformations = relationship("Transformation", back_populates="dataset", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Dataset {self.name}>"
