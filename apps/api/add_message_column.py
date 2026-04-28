import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def add_message_column():
    engine = create_async_engine(
        settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    )
    async with engine.begin() as conn:
        # Check if column exists
        result = await conn.execute(text(
            "SELECT column_name FROM information_schema.columns WHERE table_name='shares' AND column_name='message'"
        ))
        if result.fetchone() is None:
            await conn.execute(text("ALTER TABLE shares ADD COLUMN message VARCHAR(500)"))
            print("Added 'message' column to shares table.")
        else:
            print("'message' column already exists.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(add_message_column())
