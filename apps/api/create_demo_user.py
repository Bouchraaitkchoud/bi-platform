from app.core.config import settings
from sqlalchemy import create_engine, text
from app.core.security import get_password_hash
import uuid

engine = create_engine(settings.DATABASE_URL.replace('asyncpg', 'psycopg'))
conn = engine.connect()

# Check if user exists
result = conn.execute(text("SELECT id FROM users WHERE email = 'demo@example.com'"))
existing = result.fetchone()

if not existing:
    # Create user
    user_id = str(uuid.uuid4())
    password_hash = get_password_hash("demo123")
    conn.execute(text(
        "INSERT INTO users (id, email, full_name, password_hash, is_active, role) VALUES (:id, :email, :full_name, :hash, :active, :role)"
    ), {"id": user_id, "email": "demo@example.com", "full_name": "Demo User", "hash": password_hash, "active": True, "role": "user"})
    conn.commit()
    print(f"Created user demo@example.com with password demo123")
else:
    print("User already exists")

conn.close()
