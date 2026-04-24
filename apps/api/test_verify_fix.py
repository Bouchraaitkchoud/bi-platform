#!/usr/bin/env python
"""Test the password verification fix"""
import asyncio
from app.core.database import async_session
from app.models.user import User
from app.core.security import verify_password
from sqlalchemy import select

async def test_verify():
    async with async_session() as session:
        # Query the user
        stmt = select(User).where(User.email == "aaa@gmail.com")
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user:
            print(f"User: {user.email}")
            print(f"Password hash: {user.password_hash}")
            
            # Test password verification with different passwords
            test_passwords = ["demo123", "password123", "test123"]
            
            for pwd in test_passwords:
                try:
                    result = verify_password(pwd, user.password_hash)
                    status = "✓ MATCH" if result else "✗ NO MATCH"
                    print(f"\nTesting password '{pwd}': {status}")
                except Exception as e:
                    print(f"\nTesting password '{pwd}': ✗ ERROR - {type(e).__name__}: {str(e)}")
        else:
            print("User not found")

if __name__ == "__main__":
    asyncio.run(test_verify())
