#!/usr/bin/env python
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def fix_enum_case():
    async with engine.begin() as conn:
        # Update all lowercase chart type values to uppercase
        updates = [
            ("UPDATE charts SET chart_type = 'LINE' WHERE chart_type = 'line'", "line -> LINE"),
            ("UPDATE charts SET chart_type = 'BAR' WHERE chart_type = 'bar'", "bar -> BAR"),
            ("UPDATE charts SET chart_type = 'PIE' WHERE chart_type = 'pie'", "pie -> PIE"),
            ("UPDATE charts SET chart_type = 'SCATTER' WHERE chart_type = 'scatter'", "scatter -> SCATTER"),
            ("UPDATE charts SET chart_type = 'AREA' WHERE chart_type = 'area'", "area -> AREA"),
            ("UPDATE charts SET chart_type = 'HISTOGRAM' WHERE chart_type = 'histogram'", "histogram -> HISTOGRAM"),
            ("UPDATE charts SET chart_type = 'BOX' WHERE chart_type = 'box'", "box -> BOX"),
            ("UPDATE charts SET chart_type = 'TABLE' WHERE chart_type = 'table'", "table -> TABLE"),
            ("UPDATE charts SET chart_type = 'KPI_CARD' WHERE chart_type = 'kpi_card'", "kpi_card -> KPI_CARD"),
            ("UPDATE charts SET chart_type = 'GAUGE' WHERE chart_type = 'gauge'", "gauge -> GAUGE"),
            ("UPDATE charts SET chart_type = 'COMBO' WHERE chart_type = 'combo'", "combo -> COMBO"),
            ("UPDATE charts SET chart_type = 'TREEMAP' WHERE chart_type = 'treemap'", "treemap -> TREEMAP"),
            ("UPDATE charts SET chart_type = 'WATERFALL' WHERE chart_type = 'waterfall'", "waterfall -> WATERFALL"),
            ("UPDATE charts SET chart_type = 'FUNNEL' WHERE chart_type = 'funnel'", "funnel -> FUNNEL"),
            ("UPDATE charts SET chart_type = 'BUBBLE' WHERE chart_type = 'bubble'", "bubble -> BUBBLE"),
            ("UPDATE charts SET chart_type = 'HEATMAP' WHERE chart_type = 'heatmap'", "heatmap -> HEATMAP"),
            ("UPDATE charts SET chart_type = 'DONUT' WHERE chart_type = 'donut'", "donut -> DONUT"),
            ("UPDATE charts SET chart_type = 'MATRIX' WHERE chart_type = 'matrix'", "matrix -> MATRIX"),
        ]
        
        for sql, desc in updates:
            try:
                result = await conn.execute(text(sql))
                print(f"✓ {desc}")
            except Exception as e:
                print(f"✗ {desc}: {e}")
        
        print("\nChart type values after update:")
        result = await conn.execute(text("""
            SELECT DISTINCT chart_type FROM charts ORDER BY chart_type
        """))
        for row in result:
            print(f"  - {row[0]}")

if __name__ == "__main__":
    asyncio.run(fix_enum_case())
