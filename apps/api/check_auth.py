from sqlalchemy import text, create_engine
from app.core.config import settings
from app.core.security import verify_password, get_password_hash

sync_url = settings.DATABASE_URL.replace('asyncpg', 'psycopg') if 'asyncpg' in settings.DATABASE_URL else settings.DATABASE_URL
e = create_engine(sync_url)

with e.connect() as conn:
    result = conn.execute(text("SELECT email, password_hash FROM users WHERE email = 'aaa@gmail.com'"))
    row = result.fetchone()
    if row:
        email, hash_val = row
        print(f"Email: {email}")
        print(f"Hash: {hash_val[:50]}...")
        print(f"Hash length: {len(hash_val)}")
        print(f"Hash type: {'argon2' if hash_val.startswith('$argon2') else 'bcrypt' if hash_val.startswith('$2') else 'unknown'}")
        
        # Test password verification
        test_password = "demo123"
        try:
            result = verify_password(test_password, hash_val)
            print(f"\nPassword verification with '{test_password}': {result}")
        except Exception as ex:
            print(f"\nPassword verification ERROR: {ex}")
            import traceback
            traceback.print_exc()
    else:
        print("User not found")
