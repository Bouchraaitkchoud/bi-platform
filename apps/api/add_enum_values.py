#!/usr/bin/env python
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def add_enum_values():
    async with engine.begin() as conn:
        values = ['KPI_CARD', 'GAUGE', 'COMBO', 'TREEMAP', 'WATERFALL', 'FUNNEL', 'BUBBLE', 'HEATMAP', 'DONUT', 'MATRIX']
        for val in values:
            try:
                await conn.execute(text(f"ALTER TYPE charttype ADD VALUE '{val}'"))
                print(f"Added {val}")
            except Exception as e:
                error_str = str(e)
                if 'already exists' in error_str:
                    print(f"{val} already exists")
                else:
                    print(f"Error adding {val}: {e}")
        
        # Show all enum values
        result = await conn.execute(text("""
            SELECT enumlabel FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'charttype')
            ORDER BY enumsortorder
        """))
        print("\nCurrent charttype enum values:")
        for row in result:
            print(f"  - {row[0]}")

if __name__ == "__main__":
    asyncio.run(add_enum_values())
