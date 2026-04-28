from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

response = client.post(
    "/api/v1/datasets/test-db-connection",
    json={
        "db_connection_details": {
            "db_type": "postgresql",
            "host": "localhost",
            "port": 5432,
            "user": "postgres",
            "password": "test",
            "dbname": "bi_platform"
        },
        "sql_query": "SELECT 1"
    }
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
