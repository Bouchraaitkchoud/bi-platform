#!/usr/bin/env python
"""Test script to verify multi-dimension chart generation"""

import pandas as pd
import json
import sys
from pathlib import Path

# Add app directory to path
app_dir = Path(__file__).parent / "apps" / "api"
sys.path.insert(0, str(app_dir))

from app.services.chart_service import ChartService

def test_line_chart_multidim():
    """Test line chart generation with multiple dimensions"""
    # Create sample data
    df = pd.DataFrame({
        'event_type': ['click', 'click', 'view', 'view', 'click', 'click'],
        'traffic_source': ['google', 'facebook', 'google', 'facebook', 'google', 'facebook'],
        'event_date': ['2024-01-01', '2024-01-01', '2024-01-02', '2024-01-02', '2024-01-03', '2024-01-03'],
        'event_id': [1, 2, 3, 4, 5, 6],
        'user_id': [100, 101, 102, 103, 104, 105],
        'amount': [10.5, 20.3, 15.7, 25.1, 30.2, 18.9]
    })
    
    # Test with multiple dimensions
    dimensions = ['event_type', 'traffic_source']
    measures = ['amount']
    
    try:
        chart_data = ChartService._generate_line_chart(df, dimensions, measures)
        print("✓ Line chart with 2 dimensions generated successfully")
        print(f"  X-axis data: {chart_data['xAxisData']}")
        print(f"  Series count: {len(chart_data['series'])}")
        assert len(chart_data['xAxisData']) > 0, "X-axis data is empty"
        assert len(chart_data['series']) > 0, "Series data is empty"
        print("✓ Line chart data is valid")
        return True
    except Exception as e:
        print(f"✗ Error generating line chart: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_bar_chart_multidim():
    """Test bar chart generation with multiple dimensions"""
    # Create sample data
    df = pd.DataFrame({
        'event_type': ['click', 'click', 'view', 'view', 'click', 'click'],
        'traffic_source': ['google', 'facebook', 'google', 'facebook', 'google', 'facebook'],
        'amount': [10.5, 20.3, 15.7, 25.1, 30.2, 18.9]
    })
    
    # Test with multiple dimensions
    dimensions = ['event_type', 'traffic_source']
    measures = ['amount']
    
    try:
        chart_data = ChartService._generate_bar_chart(df, dimensions, measures)
        print("✓ Bar chart with 2 dimensions generated successfully")
        print(f"  X-axis data: {chart_data['xAxisData']}")
        assert len(chart_data['xAxisData']) > 0, "X-axis data is empty"
        assert len(chart_data['series']) > 0, "Series data is empty"
        print("✓ Bar chart data is valid")
        return True
    except Exception as e:
        print(f"✗ Error generating bar chart: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_area_chart_multidim():
    """Test area chart generation with multiple dimensions"""
    # Create sample data
    df = pd.DataFrame({
        'event_type': ['click', 'click', 'view', 'view', 'click', 'click'],
        'traffic_source': ['google', 'facebook', 'google', 'facebook', 'google', 'facebook'],
        'amount': [10.5, 20.3, 15.7, 25.1, 30.2, 18.9]
    })
    
    # Test with multiple dimensions
    dimensions = ['event_type', 'traffic_source']
    measures = ['amount']
    
    try:
        chart_data = ChartService._generate_area_chart(df, dimensions, measures)
        print("✓ Area chart with 2 dimensions generated successfully")
        print(f"  X-axis data: {chart_data['xAxisData']}")
        assert len(chart_data['xAxisData']) > 0, "X-axis data is empty"
        assert len(chart_data['series']) > 0, "Series data is empty"
        print("✓ Area chart data is valid")
        return True
    except Exception as e:
        print(f"✗ Error generating area chart: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing multi-dimension chart generation...\n")
    
    results = []
    results.append(("Line Chart (Multi-dim)", test_line_chart_multidim()))
    results.append(("Bar Chart (Multi-dim)", test_bar_chart_multidim()))
    results.append(("Area Chart (Multi-dim)", test_area_chart_multidim()))
    
    print("\n" + "="*50)
    print("Test Summary:")
    for test_name, passed in results:
        status = "PASSED" if passed else "FAILED"
        print(f"  {test_name}: {status}")
    
    all_passed = all(result[1] for result in results)
    sys.exit(0 if all_passed else 1)
