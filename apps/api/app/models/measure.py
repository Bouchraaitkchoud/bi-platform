from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Measure(BaseModel):
    __tablename__ = "measures"

    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False)
    name = Column(String(255), nullable=False)
    formula = Column(Text, nullable=False)
    data_type = Column(String(50), default="number")  # number, currency, percentage
    description = Column(Text, nullable=True)

    # Relationships
    dataset = relationship("Dataset", back_populates="measures")

    def to_dict(self):
        return {
            "id": str(self.id),
            "dataset_id": str(self.dataset_id),
            "name": self.name,
            "formula": self.formula,
            "data_type": self.data_type,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
