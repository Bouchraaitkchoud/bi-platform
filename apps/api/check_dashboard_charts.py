from sqlalchemy import text, create_engine, inspect
from app.core.config import settings

sync_url = settings.DATABASE_URL.replace('asyncpg', 'psycopg') if 'asyncpg' in settings.DATABASE_URL else settings.DATABASE_URL
e = create_engine(sync_url)
inspector = inspect(e)

print("Charts table columns:")
cols = inspector.get_columns('charts')
for col in cols:
    print(f"  {col['name']}: {col['type']}")

print("\nDashboards table columns:")
cols = inspector.get_columns('dashboards')
for col in cols:
    print(f"  {col['name']}: {col['type']}")

# Find dashboards with charts
conn = e.connect()
result = conn.execute(text("SELECT id, name, dashboard_id FROM charts WHERE dashboard_id IS NOT NULL LIMIT 10"))
print("\nCharts with dashboard_id:")
for row in result:
    print(f"  Chart {row[0]}: {row[1]} -> Dashboard {row[2]}")

# Get a dashboard ID and show its charts
result = conn.execute(text("SELECT DISTINCT dashboard_id FROM charts WHERE dashboard_id IS NOT NULL LIMIT 1"))
dash_id = result.fetchone()
if dash_id:
    print(f"\nCharts in dashboard {dash_id[0]}:")
    result = conn.execute(text(f"SELECT id, name FROM charts WHERE dashboard_id = '{dash_id[0]}'"))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
