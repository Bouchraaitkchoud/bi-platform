# apps/api/app/api/users.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
import uuid

from app.core.database import get_db
from app.core.security import verify_token
from app.core.dependencies import get_current_user
from app.schemas.user import UserResponse, UserSearchResult
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])
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


@router.get("/search", response_model=list[UserSearchResult])
async def search_users(
    q: str = "",
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Search for users by email or name (for sharing purposes)"""
    
    try:
        if not q or len(q.strip()) < 2:
            return []
        
        # Search query - case insensitive
        search_term = f"%{q.lower()}%"
        
        # Query users by email or full_name
        stmt = select(User).where(
            (User.is_active == True) &
            (
                or_(
                    User.email.ilike(search_term),
                    User.full_name.ilike(search_term)
                )
            ) &
            (User.id != uuid.UUID(current_user["user_id"]))  # Exclude self
        ).offset(skip).limit(limit)
        
        result = await db.execute(stmt)
        users = result.scalars().all()
        
        return [
            UserSearchResult(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
            )
            for user in users
        ]
    except Exception as e:
        print(f"Error searching users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search users"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    """Get user by ID"""
    
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    stmt = select(User).where(User.id == user_uuid)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at
    )
