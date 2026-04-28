# apps/api/app/models/share.py
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from datetime import datetime


class Share(BaseModel):
    __tablename__ = "shares"
    
    dashboard_id = Column(UUID(as_uuid=True), ForeignKey("dashboards.id"), nullable=False, index=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    shared_with_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    shared_with_email = Column(String(255), nullable=True)  # For sharing with registered users
    can_view = Column(Boolean, default=True)  # Can view dashboard and charts
    can_comment = Column(Boolean, default=False)  # Can add comments and feedback
    can_edit = Column(Boolean, default=False)  # Can modify and edit dashboard
    message = Column(String(500), nullable=True)  # Why the dashboard was shared
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Share dashboard {self.dashboard_id}>"
