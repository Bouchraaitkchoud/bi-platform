#!/usr/bin/env python
import asyncio
import psycopg
from app.core.config import settings

async def fix_enum_case_raw():
    # Connect directly with psycopg (not SQLAlchemy) to bypass enum validation
    db_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "")
    
    try:
        async with await psycopg.AsyncConnection.connect(db_url) as conn:
            async with conn.cursor() as cur:
                # Get current values in the table
                await cur.execute("SELECT DISTINCT chart_type FROM charts")
                current_values = [row[0] for row in await cur.fetchall()]
                print("Current chart_type values in database:")
                for val in current_values:
                    print(f"  - {val}")
                
                if not current_values:
                    print("\nNo charts in database, nothing to update")
                    return
                
                # Try to identify which ones are lowercase
                lowercase_values = [v for v in current_values if v and v.islower()]
                
                if lowercase_values:
                    print(f"\nFound {len(lowercase_values)} lowercase values, attempting to update...")
                    
                    # Use direct SQL CAST to bypass enum validation
                    for old_val in lowercase_values:
                        new_val = old_val.upper()
                        print(f"  Updating {old_val} -> {new_val}")
                        # Cast to TEXT first, then back to enum
                        sql = f"""
                            UPDATE charts 
                            SET chart_type = '{new_val}'::charttype 
                            WHERE chart_type::text = '{old_val}'
                        """
                        try:
                            await cur.execute(sql)
                            print(f"    ✓ Updated")
                        except Exception as e:
                            print(f"    ✗ Error: {e}")
                    
                    await conn.commit()
                    print("\nUpdate complete!")
                else:
                    print("\nAll values are already uppercase or empty")
                    
                # Show final result
                await cur.execute("SELECT DISTINCT chart_type FROM charts ORDER BY chart_type")
                final_values = [row[0] for row in await cur.fetchall()]
                print("\nFinal chart_type values in database:")
                for val in final_values:
                    print(f"  - {val}")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(fix_enum_case_raw())
