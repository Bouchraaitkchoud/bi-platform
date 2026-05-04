# apps/api/app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel
from datetime import datetime


class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="user")  # admin, user, viewer
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    last_activity = Column(DateTime(timezone=True), nullable=True)  # For session expiry tracking (30 min inactivity)
    active_db_connection = Column(JSON, nullable=True)
    active_db_query_history = Column(JSON, nullable=True)
    
    def __repr__(self):
        return f"<User {self.email}>"
