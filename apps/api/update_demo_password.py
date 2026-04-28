from sqlalchemy import text, create_engine
from app.core.config import settings
from app.core.security import get_password_hash

# First, list all users to find the correct email
sync_url = settings.DATABASE_URL.replace("asyncpg", "psycopg") if "asyncpg" in settings.DATABASE_URL else settings.DATABASE_URL
sync_engine = create_engine(sync_url)

print("Finding users in database:")
with sync_engine.connect() as conn:
    result = conn.execute(text("SELECT id, email, full_name FROM users LIMIT 10"))
    for row in result:
        print(f"  ID: {row[0]}, Email: {row[1]}, Name: {row[2]}")

# Try to find and update demo user with any email pattern
with sync_engine.connect() as conn:
    # First try exact match
    result = conn.execute(text("SELECT email FROM users WHERE email ILIKE '%demo%' OR email = 'aaa@gmail.com'"))
    demo_email = result.fetchone()
    if demo_email:
        demo_email = demo_email[0]
        print(f"\nFound user: {demo_email}")
        
        # Generate new argon2 hash for demo123
        new_hash = get_password_hash('demo123')
        print(f"New password hash: {new_hash[:30]}...")
        
        # Update
        result = conn.execute(
            text("UPDATE users SET password_hash = :hash WHERE email = :email"),
            {"hash": new_hash, "email": demo_email}
        )
        conn.commit()
        print(f"Updated {result.rowcount} user(s)")
    else:
        print("No demo user found")

sync_engine.dispose()
