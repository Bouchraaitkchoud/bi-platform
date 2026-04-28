import urllib.request
import json

url = 'http://localhost:8001/api/v1/openapi.json'
req = urllib.request.Request(url, method='GET')

with urllib.request.urlopen(req) as response:
    schema = json.loads(response.read().decode())
    
# Print all paths
print("Available paths:")
for path in schema.get('paths', {}).keys():
    if 'datasets' in path:
        print(f"  {path}")
