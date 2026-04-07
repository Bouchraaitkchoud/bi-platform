#!/usr/bin/env python
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_and_fix_enums():
    async with engine.begin() as conn:
        # First, get the current enum values in the database WITHOUT using the enum type
        # Use raw text comparison to see what's stored
        result = await conn.execute(text("""
            SELECT enumlabel FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'charttype')
            ORDER BY enumsortorder
        """))
        enum_values = [row[0] for row in result]
        print("Available PostgreSQL enum values:")
        for val in enum_values:
            print(f"  - {val}")
        
        # Check what's actually in the charts table by casting to text
        result = await conn.execute(text("""
            SELECT DISTINCT chart_type::text FROM charts ORDER BY chart_type::text
        """))
        stored_values = [row[0] for row in result]
        print(f"\nStored chart_type values (as text):")
        for val in stored_values:
            print(f"  - {val}")
        
        if not stored_values:
            print("\nNo charts in database!")
            return
        
        # Identify lowercase values
        lowercase_values = [v for v in stored_values if v and not v.isupper()]
        
        if lowercase_values:
            print(f"\nFound {len(lowercase_values)} lowercase values to update")
            for old_val in lowercase_values:
                new_val = old_val.upper()
                try:
                    # Here's the key: cast to text in WHERE clause, assign as enum in SET
                    await conn.execute(text(f"""
                        UPDATE charts 
                        SET chart_type = '{new_val}'::charttype 
                        WHERE chart_type::text = '{old_val}'
                    """))
                    print(f"  ✓ Updated {old_val} -> {new_val}")
                except Exception as e:
                    print(f"  ✗ Failed to update {old_val}: {e}")
            
            await conn.commit()
        else:
            print("\nAll values are uppercase or in database")

if __name__ == "__main__":
    asyncio.run(check_and_fix_enums())
