# apps/api/app/api/dashboards.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.core.database import get_db
from app.core.security import verify_token
from app.core.dependencies import get_current_user
from app.schemas.dashboard import DashboardCreate, DashboardResponse, DashboardUpdate, DashboardPermissions
from app.models.dashboard import Dashboard
from app.models.share import Share

router = APIRouter(prefix="/dashboards", tags=["dashboards"])
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


@router.post("", response_model=DashboardResponse, status_code=status.HTTP_201_CREATED)
async def create_dashboard(
    dashboard_data: DashboardCreate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Create a new dashboard"""
    
    db_dashboard = Dashboard(
        id=uuid.uuid4(),
        user_id=uuid.UUID(current_user["user_id"]),
        name=dashboard_data.name,
        description=dashboard_data.description,
        layout_config=dashboard_data.layout_config,
        chart_ids=dashboard_data.chart_ids
    )
    
    db.add(db_dashboard)
    await db.commit()
    await db.refresh(db_dashboard)
    
    return db_dashboard


@router.get("", response_model=list[DashboardResponse])
async def list_dashboards(
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """List user's dashboards"""
    
    stmt = select(Dashboard).where(
        Dashboard.user_id == uuid.UUID(current_user["user_id"])
    ).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    dashboards = result.scalars().all()
    
    return dashboards


@router.get("/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard by ID - allows access if user owns it or it's shared with them"""
    
    current_user_id = uuid.UUID(current_user["user_id"])
    
    # Check if user owns the dashboard
    stmt = select(Dashboard).where(
        (Dashboard.id == dashboard_id) &
        (Dashboard.user_id == current_user_id)
    )
    
    result = await db.execute(stmt)
    dashboard = result.scalar_one_or_none()
    
    # Default permissions for owned dashboard
    permissions = None
    
    # If user doesn't own it, check if it's shared with them
    if not dashboard:
        share_stmt = select(Dashboard, Share).join(
            Share,
            (Share.dashboard_id == Dashboard.id) &
            (Share.shared_with_user_id == current_user_id) &
            (Share.can_view == True)
        ).where(Dashboard.id == dashboard_id)
        
        share_result = await db.execute(share_stmt)
        share_row = share_result.one_or_none()
        
        if share_row:
            dashboard, share = share_row
            # Set permissions from the share record
            permissions = DashboardPermissions(
                can_view=share.can_view,
                can_edit=share.can_edit,
                can_comment=share.can_comment
            )
    else:
        # User owns the dashboard, so they have all permissions
        permissions = DashboardPermissions(
            can_view=True,
            can_edit=True,
            can_comment=True
        )
    
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found or access denied"
        )
    
    # Return DashboardResponse with permissions
    return DashboardResponse(
        id=dashboard.id,
        name=dashboard.name,
        description=dashboard.description,
        user_id=dashboard.user_id,
        layout_config=dashboard.layout_config,
        chart_ids=dashboard.chart_ids,
        created_at=dashboard.created_at,
        updated_at=dashboard.updated_at,
        permissions=permissions
    )


@router.put("/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: uuid.UUID,
    dashboard_update: DashboardUpdate,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Update dashboard - allows update if user owns it or has edit permission on shared dashboard"""
    
    current_user_id = uuid.UUID(current_user["user_id"])
    
    # Check if user owns the dashboard
    stmt = select(Dashboard).where(
        (Dashboard.id == dashboard_id) &
        (Dashboard.user_id == current_user_id)
    )
    
    result = await db.execute(stmt)
    dashboard = result.scalar_one_or_none()
    
    # If user doesn't own it, check if it's shared with edit permission
    if not dashboard:
        share_stmt = select(Dashboard).join(
            Share,
            (Share.dashboard_id == Dashboard.id) &
            (Share.shared_with_user_id == current_user_id) &
            (Share.can_edit == True)
        ).where(Dashboard.id == dashboard_id)
        
        share_result = await db.execute(share_stmt)
        dashboard = share_result.scalar_one_or_none()
    
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Dashboard not found or you don't have edit permission"
        )
    
    if dashboard_update.name:
        dashboard.name = dashboard_update.name
    if dashboard_update.description is not None:
        dashboard.description = dashboard_update.description
    if dashboard_update.layout_config:
        dashboard.layout_config = dashboard_update.layout_config
    if dashboard_update.chart_ids:
        dashboard.chart_ids = dashboard_update.chart_ids
    
    await db.commit()
    await db.refresh(dashboard)
    
    return dashboard


@router.delete("/{dashboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard(
    dashboard_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Delete dashboard"""
    
    stmt = select(Dashboard).where(
        (Dashboard.id == dashboard_id) &
        (Dashboard.user_id == uuid.UUID(current_user["user_id"]))
    )
    
    result = await db.execute(stmt)
    dashboard = result.scalar_one_or_none()
    
    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found"
        )
    
    await db.delete(dashboard)
    await db.commit()
