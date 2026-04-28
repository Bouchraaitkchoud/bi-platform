#!/usr/bin/env python3
"""Test the warehouse table preview endpoint"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# First, get a token by logging in
def login():
    resp = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "aaa@gmail.com", "password": "123456789"}
    )
    print(f"Login response: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        token = data['access_token']
        print(f"✓ Got token: {token[:20]}...")
        return token
    else:
        print(f"✗ Login failed: {resp.text}")
        return None

# Get a list of warehouses for the user
def get_warehouses(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = requests.get(f"{BASE_URL}/warehouses", headers=headers)
    print(f"\nGet warehouses response: {resp.status_code}")
    
    if resp.status_code == 200:
        warehouses = resp.json()
        print(f"Found {len(warehouses)} warehouse(s):")
        
        for wh in warehouses:
            print(f"  - ID: {wh['id']}")
            print(f"    Name: {wh['name']}")
            if 'tables' in wh:
                print(f"    Tables: {len(wh['tables'])} table(s)")
                for table in wh['tables'][:3]:  # Show first 3 tables
                    print(f"      - {table['name']}")
        
        return warehouses
    else:
        print(f"✗ Get warehouses failed: {resp.text}")
        return []

# Test the preview endpoint
def test_preview(token, warehouse_id, table_name):
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"\n📊 Testing preview for table: {table_name}")
    
    preview_url = f"{BASE_URL}/warehouses/{warehouse_id}/tables/{table_name}/preview"
    print(f"   URL: {preview_url}")
    
    resp = requests.get(preview_url, headers=headers)
    print(f"   Response status: {resp.status_code}")
    
    if resp.status_code == 200:
        print("   ✓ SUCCESS!")
        data = resp.json()
        if data['columns']:
            print(f"   Columns: {data['columns'][:5]}...")  # Show first 5 columns
        print(f"   Row count: {data['row_count']}")
        print(f"   Data rows returned: {len(data['data'])}")
    else:
        print(f"   ✗ ERROR:")
        try:
            error = resp.json()
            print(f"      {error['detail']}")
        except:
            print(f"      {resp.text}")

def main():
    # Login first
    token = login()
    if not token:
        return
    
    # Get warehouses
    warehouses = get_warehouses(token)
    if not warehouses:
        print("\nNo warehouses found. Exiting.")
        return
    
    # Find and test the "Test Warehouse v2" warehouse
    target_warehouse = None
    for wh in warehouses:
        if "Test Warehouse v2" in wh.get('name', ''):
            target_warehouse = wh
            break
    
    if not target_warehouse:
        print(f"\nWarehouse 'Test Warehouse v2' not found. Testing first warehouse instead.")
        target_warehouse = warehouses[0]
    
    # Test preview for first table in the warehouse
    if target_warehouse.get('tables'):
        table = target_warehouse['tables'][0]
        test_preview(token, target_warehouse['id'], table['name'])
    else:
        print(f"\nNo tables in warehouse. Exiting.")

if __name__ == "__main__":
    main()

