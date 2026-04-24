#!/usr/bin/env python
"""Check and display the password hash for a specific user"""
import asyncio
from app.core.database import engine, async_session
from app.models.user import User
from sqlalchemy import select
from app.core.security import get_password_hash

async def check_user():
    async with async_session() as session:
        # Query the user
        stmt = select(User).where(User.email == "aaa@gmail.com")
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            print(f"User found: {user.email}")
            print(f"Password hash: {user.password_hash}")
            print(f"Password hash length: {len(user.password_hash)}")
            print(f"Password hash type: {type(user.password_hash)}")
            print(f"\nHash starts with: {user.password_hash[:20]}")
            
            # Check if it looks like a valid bcrypt hash
            if user.password_hash.startswith("$2"):
                print("✓ Looks like a valid bcrypt hash")
            else:
                print("✗ Does NOT look like a valid bcrypt hash")
                print("\nFixing with proper hash...")
                
                # Hash a test password
                test_password = "demo123"
                new_hash = get_password_hash(test_password)
                print(f"New hash for '{test_password}': {new_hash}")
        else:
            print("User not found")

if __name__ == "__main__":
    asyncio.run(check_user())
