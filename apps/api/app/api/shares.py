# apps/api/app/api/shares.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
import uuid

from app.core.database import get_db
from app.core.security import verify_token
from app.core.dependencies import get_current_user
from app.schemas.share import ShareCreate, ShareResponse, ShareUpdate, PermissionsModel, SharedUserResponse
from app.models.share import Share
from app.models.dashboard import Dashboard
from app.models.user import User
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/shares", tags=["shares"])
security = HTTPBearer()


async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extract user from token"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return {"user_id": user_id}


@router.post("", response_model=SharedUserResponse, status_code=status.HTTP_201_CREATED)
async def create_share(
    share_data: ShareCreate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Share a dashboard with another user"""
    
    try:
        # Verify dashboard exists and belongs to user
        stmt = select(Dashboard).where(
            (Dashboard.id == share_data.dashboard_id) &
            (Dashboard.user_id == uuid.UUID(current_user["user_id"]))
        )
        result = await db.execute(stmt)
        dashboard = result.scalar_one_or_none()
        
        if not dashboard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dashboard not found"
            )
        
        # Get owner user info
        owner_stmt = select(User).where(User.id == uuid.UUID(current_user["user_id"]))
        owner_result = await db.execute(owner_stmt)
        owner = owner_result.scalar_one_or_none()
        
        db_share = Share(
            id=uuid.uuid4(),
            dashboard_id=share_data.dashboard_id,
            owner_id=uuid.UUID(current_user["user_id"]),
            shared_with_user_id=share_data.shared_with_user_id,
            shared_with_email=share_data.shared_with_email,
            can_view=share_data.permissions.can_view,
            can_comment=share_data.permissions.can_comment,
            can_edit=share_data.permissions.can_edit,
            expires_at=getattr(share_data, 'expires_at', None)
        )
        
        db.add(db_share)
        await db.commit()
        await db.refresh(db_share)
        
        # Send email notification
        recipient_email = share_data.shared_with_email or (
            (await db.execute(select(User).where(User.id == share_data.shared_with_user_id))).scalar_one_or_none().email
            if share_data.shared_with_user_id
            else None
        )
        
        if recipient_email and owner:
            dashboard_url = f"http://localhost:3000/dashboards/{share_data.dashboard_id}"
            await NotificationService.send_dashboard_shared_notification(
                recipient_email=recipient_email,
                recipient_name="Team Member",
                dashboard_name=dashboard.name,
                owner_name=owner.full_name or owner.email,
                permissions=share_data.permissions,
                dashboard_url=dashboard_url,
            )
        
        return SharedUserResponse.from_share(db_share)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating share: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create share"
        )


@router.get("", response_model=list[SharedUserResponse])
async def list_shares(
    dashboard_id: str = None,
    shared_with_me: bool = False,
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """List shares for dashboards or dashboards shared with current user"""
    
    try:
        current_user_id = uuid.UUID(current_user["user_id"])
        
        if shared_with_me:
            # Get dashboards shared with me (by email or user_id)
            stmt = select(Share).where(
                or_(
                    Share.shared_with_user_id == current_user_id,
                )
            )
        elif dashboard_id:
            # Get shares for a specific dashboard (only if owner)
            try:
                dashboard_uuid = uuid.UUID(dashboard_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid dashboard ID format"
                )
            
            stmt = select(Share).where(
                (Share.dashboard_id == dashboard_uuid) &
                (Share.owner_id == current_user_id)
            )
        else:
            # Get all shares owned by current user
            stmt = select(Share).where(
                Share.owner_id == current_user_id
            )
        
        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        shares = result.scalars().all()
        
        return [SharedUserResponse.from_share(share) for share in shares]
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error listing shares: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list shares"
        )


@router.put("/{share_id}", response_model=SharedUserResponse)
async def update_share(
    share_id: uuid.UUID,
    share_update: ShareUpdate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Update share permissions"""
    
    try:
        stmt = select(Share).where(
            (Share.id == share_id) &
            (Share.owner_id == uuid.UUID(current_user["user_id"]))
        )
        
        result = await db.execute(stmt)
        share = result.scalar_one_or_none()
        
        if not share:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Share not found"
            )
        
        if share_update.permissions:
            share.can_view = share_update.permissions.can_view
            share.can_comment = share_update.permissions.can_comment
            share.can_edit = share_update.permissions.can_edit
        if share_update.expires_at:
            share.expires_at = share_update.expires_at
        
        await db.commit()
        await db.refresh(share)
        
        return SharedUserResponse.from_share(share)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating share: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update share"
        )


@router.delete("/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_share(
    share_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Delete share"""
    
    try:
        stmt = select(Share).where(
            (Share.id == share_id) &
            (Share.owner_id == uuid.UUID(current_user["user_id"]))
        )
        
        result = await db.execute(stmt)
        share = result.scalar_one_or_none()
        
        if not share:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Share not found"
            )
        
        await db.delete(share)
        await db.commit()
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting share: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete share"
        )
