import urllib.request
import json

url = 'http://localhost:8001/api/v1/openapi.json'
req = urllib.request.Request(url, method='GET')

with urllib.request.urlopen(req) as response:
    schema = json.loads(response.read().decode())
    
# Print all paths
print("All paths in OpenAPI:")
for path in sorted(schema.get('paths', {}).keys()):
    print(f"  {path}")
