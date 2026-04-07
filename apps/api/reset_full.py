from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(str(settings.DATABASE_URL))

# Drop tables one by one with separate transactions
tables_to_drop = ['warehouse_tables', 'warehouse_relationships', 'data_tables', 'data_warehouses']
for table in tables_to_drop:
    try:
        with engine.begin() as conn:
            conn.execute(text(f'DROP TABLE IF EXISTS {table} CASCADE'))
            print(f'Dropped {table}')
    except Exception as e:
        print(f'{table}: {e}')

# Reset alembic version in separate transaction
with engine.begin() as conn:
    conn.execute(text("UPDATE alembic_version SET version_num = 'g1h2i3j4k5l6'"))
    print('Alembic version reset')

