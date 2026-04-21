from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Hierarchy(BaseModel):
    __tablename__ = "hierarchies"

    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False)
    name = Column(String(255), nullable=False)
    hierarchy_type = Column(String(50), default="custom")  # date, geographic, custom
    columns = Column(JSON, default=list)  # List of column names in hierarchy order

    # Relationships
    dataset = relationship("Dataset", back_populates="hierarchies")

    def to_dict(self):
        return {
            "id": str(self.id),
            "dataset_id": str(self.dataset_id),
            "name": self.name,
            "hierarchy_type": self.hierarchy_type,
            "columns": self.columns or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
