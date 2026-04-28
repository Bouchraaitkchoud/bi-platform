#!/usr/bin/env python
"""Set password for aaa@gmail.com to 123456789"""
import asyncio
from app.core.database import async_session
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select, update

async def set_password():
    email = "aaa@gmail.com"
    new_password = "123456789"
    
    async with async_session() as session:
        # Find the user
        stmt = select(User).where(User.email == email)
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"User with email '{email}' not found!")
            return
        
        # Hash the new password
        new_hash = get_password_hash(new_password)
        
        # Update the user's password hash
        stmt = update(User).where(User.id == user.id).values(password_hash=new_hash)
        await session.execute(stmt)
        await session.commit()
        
        print(f"✓ Password updated successfully!")
        print(f"\nLogin credentials:")
        print(f"Email: {email}")
        print(f"Password: {new_password}")

if __name__ == "__main__":
    asyncio.run(set_password())
