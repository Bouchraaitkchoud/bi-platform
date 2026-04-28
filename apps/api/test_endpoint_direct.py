import urllib.request
import json

url = 'http://localhost:8001/api/v1/datasets/test-db-connection'
data = {
    'db_connection_details': {
        'db_type': 'postgresql',
        'host': 'localhost',
        'port': 5432,
        'user': 'postgres',
        'password': 'test',
        'dbname': 'bi_platform'
    },
    'sql_query': 'SELECT 1'
}

req = urllib.request.Request(
    url,
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as response:
        print(f'Status: {response.status}')
        print(f'Response: {response.read().decode()}')
except urllib.error.HTTPError as e:
    print(f'Status: {e.code}')
    print(f'Response: {e.read().decode()}')
