from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(str(settings.DATABASE_URL))

with engine.begin() as conn:
    conn.execute(text("UPDATE alembic_version SET version_num = 'g1h2i3j4k5l6'"))
    
print('Alembic version reset to g1h2i3j4k5l6')
