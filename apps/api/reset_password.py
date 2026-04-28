#!/usr/bin/env python
"""Reset password for a user account"""
import asyncio
from app.core.database import async_session
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select, update

async def reset_password():
    email = input("Enter the email address to reset: ").strip()
    new_password = input("Enter the new password: ").strip()
    
    if not email or not new_password:
        print("Email and password are required!")
        return
    
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
        
        print(f"\n✓ Password reset successfully!")
        print(f"Email: {user.email}")
        print(f"New password: {new_password}")
        print(f"\nYou can now login with these credentials.")

if __name__ == "__main__":
    asyncio.run(reset_password())
