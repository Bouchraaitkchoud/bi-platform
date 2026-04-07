from sqlalchemy import inspect, create_engine
from app.core.config import settings

engine = create_engine(str(settings.DATABASE_URL))
inspector = inspect(engine)
tables = inspector.get_table_names()

warehouse_tables = [t for t in tables if 'warehouse' in t or 'data_' in t]
print('Warehouse tables:')
for table in sorted(warehouse_tables):
    print(f'\n{table}:')
    columns = inspector.get_columns(table)
    for col in columns:
        nullable = 'nullable' if col['nullable'] else 'NOT NULL'
        print(f'  - {col["name"]}: {col["type"]} {nullable}')
