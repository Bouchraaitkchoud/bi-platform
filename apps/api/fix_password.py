#!/usr/bin/env python
"""Fix the password hash for aaa@gmail.com user"""
import asyncio
from app.core.database import async_session
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select, update

async def fix_password():
    async with async_session() as session:
        # Find the user
        stmt = select(User).where(User.email == "aaa@gmail.com")
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            # Hash the new password
            new_password = "demo123"
            new_hash = get_password_hash(new_password)
            
            print(f"Updating password for {user.email}")
            print(f"New hash: {new_hash}")
            
            # Update the user's password hash
            stmt = update(User).where(User.id == user.id).values(password_hash=new_hash)
            await session.execute(stmt)
            await session.commit()
            
            print(f"✓ Password updated successfully!")
            print(f"You can now login with:")
            print(f"  Email: aaa@gmail.com")
            print(f"  Password: {new_password}")
        else:
            print("User not found")

if __name__ == "__main__":
    asyncio.run(fix_password())
