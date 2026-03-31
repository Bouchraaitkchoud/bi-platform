# apps/api/app/schemas/share.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class PermissionsModel(BaseModel):
    """Granular permissions for dashboard sharing"""
    can_view: bool = True  # Can view dashboard and charts
    can_comment: bool = False  # Can add comments and feedback
    can_edit: bool = False  # Can modify and edit dashboard


class ShareBase(BaseModel):
    permissions: PermissionsModel


class ShareCreate(ShareBase):
    dashboard_id: UUID
    shared_with_user_id: Optional[UUID] = None
    shared_with_email: Optional[EmailStr] = None


class ShareUpdate(BaseModel):
    permissions: Optional[PermissionsModel] = None
    expires_at: Optional[datetime] = None


class ShareResponse(BaseModel):
    """Response for share details (internal use and API)"""
    id: UUID
    dashboard_id: UUID
    owner_id: UUID
    shared_with_user_id: Optional[UUID]
    shared_with_email: Optional[str]
    permissions: PermissionsModel
    expires_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = False


class SharedUserResponse(BaseModel):
    """Response for shared user list (matches frontend SharedUser interface)"""
    id: str
    email: str
    permissions: PermissionsModel
    shared_at: str
    
    @classmethod
    def from_share(cls, share_obj):
        """Build response from Share database object"""
        return cls(
            id=str(share_obj.id),
            email=share_obj.shared_with_email or "",
            permissions=PermissionsModel(
                can_view=share_obj.can_view,
                can_comment=share_obj.can_comment,
                can_edit=share_obj.can_edit
            ),
            shared_at=share_obj.created_at.isoformat() if share_obj.created_at else ""
        )
