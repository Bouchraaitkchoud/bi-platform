import asyncio
import sys
sys.path.insert(0, 'apps/api')
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def check_datasets():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT id, name, file_type, original_file FROM datasets LIMIT 5"))
        rows = result.fetchall()
        print(f"Found {len(rows)} datasets:")
        for row in rows:
            print(f"  ID: {row[0]}, Name: {row[1]}, Type: {row[2]}, File: {row[3]}")

if __name__ == "__main__":
    asyncio.run(check_datasets())
