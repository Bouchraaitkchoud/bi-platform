#!/usr/bin/env python
"""Diagnose login issues by checking all users and their password hashes"""
import asyncio
from app.core.database import async_session
from app.models.user import User
from app.core.security import verify_password
from sqlalchemy import select

async def diagnose_users():
    async with async_session() as session:
        # Get all users
        stmt = select(User).order_by(User.created_at)
        result = await session.execute(stmt)
        users = result.scalars().all()
        
        if not users:
            print("No users found in database!")
            return
        
        print(f"Found {len(users)} user(s):\n")
        
        for user in users:
            print(f"Email: {user.email}")
            print(f"Full Name: {user.full_name}")
            print(f"Role: {user.role}")
            print(f"Is Active: {user.is_active}")
            print(f"Password Hash Type: ", end="")
            
            if user.password_hash.startswith("$2"):
                print("bcrypt")
            elif user.password_hash.startswith("$argon2"):
                print("argon2id")
            else:
                print("UNKNOWN/INVALID")
            
            print(f"Password Hash: {user.password_hash[:50]}...")
            
            # Try to test password verification
            test_passwords = ["demo123", "password123", "test123", "123456"]
            found_match = False
            
            for pwd in test_passwords:
                try:
                    if verify_password(pwd, user.password_hash):
                        print(f"✓ Password matches: '{pwd}'")
                        found_match = True
                        break
                except Exception as e:
                    pass
            
            if not found_match:
                print(f"✗ None of the test passwords match")
            
            print("-" * 80)

if __name__ == "__main__":
    asyncio.run(diagnose_users())
