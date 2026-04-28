import urllib.request
import json

# Test GET /api/v1/datasets
url = 'http://localhost:8001/api/v1/datasets'
req = urllib.request.Request(url, method='GET')

try:
    with urllib.request.urlopen(req) as response:
        print(f'GET /datasets Status: {response.status}')
        print(f'Response: {response.read().decode()}')
except urllib.error.HTTPError as e:
    print(f'GET /datasets Status: {e.code}')
    print(f'Response: {e.read().decode()}')
