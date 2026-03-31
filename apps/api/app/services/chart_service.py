# apps/api/app/services/chart_service.py
"""
Chart data generation and processing service
Handles chart data generation based on dataset and chart configuration
"""
from typing import Dict, Any, List, Optional
from pathlib import Path
import pandas as pd
import json
from datetime import datetime, date


class ChartService:
    """Service for generating chart data"""
    
    @staticmethod
    def _read_cleaned_dataset(file_path: str) -> pd.DataFrame:
        """Read cleaned dataset from file"""
        try:
            # Check if file exists
            path = Path(file_path)
            if not path.exists():
                raise FileNotFoundError(f"Dataset file not found at: {file_path}")
            
            if file_path.endswith('.csv'):
                return pd.read_csv(file_path)
            elif file_path.endswith('.xlsx'):
                return pd.read_excel(file_path)
            elif file_path.endswith('.json'):
                return pd.read_json(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_path}")
        except FileNotFoundError as e:
            raise Exception(f"Dataset file not found: {str(e)}")
        except Exception as e:
            raise Exception(f"Error reading dataset: {str(e)}")
    
    @staticmethod
    def _convert_to_serializable(obj):
        """Convert non-serializable objects to serializable types"""
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        elif pd.isna(obj):
            return None
        elif isinstance(obj, (int, float)):
            if pd.isna(obj):
                return None
            return float(obj) if isinstance(obj, float) else int(obj)
        return str(obj)
    
    @staticmethod
    async def generate_chart_data(
        file_path: str,
        chart_type: str,
        dimensions: Optional[List[str]] = None,
        measures: Optional[List[str]] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate chart data based on dataset and configuration
        
        Args:
            file_path: Path to cleaned dataset
            chart_type: Type of chart (line, bar, pie, etc.)
            dimensions: Column names for dimensions (X-axis)
            measures: Column names for measures (Y-axis/values)
            config: Additional chart configuration
        
        Returns:
            Dictionary with chart data and configuration
        """
        try:
            # Default config
            if config is None:
                config = {}
            if dimensions is None:
                dimensions = []
            if measures is None:
                measures = []
            
            # Resolve file path
            resolved_path = ChartService._resolve_file_path(file_path)
            
            # Read dataset
            df = ChartService._read_cleaned_dataset(resolved_path)
            
            # Validate columns
            all_cols = list(set(dimensions + measures))
            missing_cols = [col for col in all_cols if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Columns not found in dataset: {missing_cols}")
            
            # Generate data based on chart type
            if chart_type == 'line':
                chart_data = ChartService._generate_line_chart(df, dimensions, measures)
            elif chart_type == 'bar':
                chart_data = ChartService._generate_bar_chart(df, dimensions, measures)
            elif chart_type == 'pie':
                chart_data = ChartService._generate_pie_chart(df, dimensions, measures)
            elif chart_type == 'scatter':
                chart_data = ChartService._generate_scatter_chart(df, dimensions, measures)
            elif chart_type == 'area':
                chart_data = ChartService._generate_area_chart(df, dimensions, measures)
            elif chart_type == 'histogram':
                chart_data = ChartService._generate_histogram(df, dimensions, measures)
            elif chart_type == 'box':
                chart_data = ChartService._generate_box_plot(df, dimensions, measures)
            elif chart_type == 'table':
                chart_data = ChartService._generate_table_data(df, dimensions, measures)
            else:
                raise ValueError(f"Unsupported chart type: {chart_type}")
            
            return {
                "chart_type": chart_type,
                "data": chart_data,
                "config": config,
                "dimensions": dimensions,
                "measures": measures
            }
        
        except Exception as e:
            raise Exception(f"Error generating chart data: {str(e)}")
    
    @staticmethod
    def _generate_line_chart(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate line chart data"""
        if not dimensions or not measures:
            raise ValueError("Line chart requires at least one dimension and one measure")
        
        try:
            # Group by dimension and aggregate measures
            if len(dimensions) == 1:
                grouped = df.groupby(dimensions[0])[measures].sum()
                
                return {
                    "xAxisData": [str(ChartService._convert_to_serializable(x)) for x in grouped.index],
                    "series": [
                        {
                            "name": measure,
                            "data": [ChartService._convert_to_serializable(v) for v in grouped[measure]],
                            "type": "line",
                            "smooth": True
                        }
                        for measure in measures
                    ]
                }
            else:
                # Multi-dimension: treat first as primary
                grouped = df.groupby(dimensions)[measures].sum()
                # Convert multi-level index to x-axis labels
                xaxis = []
                for idx in grouped.index:
                    if isinstance(idx, tuple):
                        label = "-".join(str(ChartService._convert_to_serializable(x)) for x in idx)
                    else:
                        label = str(ChartService._convert_to_serializable(idx))
                    xaxis.append(label)
                
                return {
                    "xAxisData": xaxis,
                    "series": [
                        {
                            "name": measure,
                            "data": [ChartService._convert_to_serializable(v) for v in grouped[measure]],
                            "type": "line",
                            "smooth": True
                        }
                        for measure in measures
                    ]
                }
        except Exception as e:
            raise ValueError(f"Error generating line chart: {str(e)}")
    
    @staticmethod
    def _generate_bar_chart(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate bar chart data"""
        if not dimensions or not measures:
            raise ValueError("Bar chart requires at least one dimension and one measure")
        
        try:
            if len(dimensions) == 1:
                grouped = df.groupby(dimensions[0])[measures].sum()
                
                return {
                    "xAxisData": [str(ChartService._convert_to_serializable(x)) for x in grouped.index],
                    "series": [
                        {
                            "name": measure,
                            "data": [ChartService._convert_to_serializable(v) for v in grouped[measure]],
                            "type": "bar"
                        }
                        for measure in measures
                    ]
                }
            else:
                grouped = df.groupby(dimensions)[measures].sum()
                # Convert multi-level index to x-axis labels
                xaxis = []
                for idx in grouped.index:
                    if isinstance(idx, tuple):
                        label = "-".join(str(ChartService._convert_to_serializable(x)) for x in idx)
                    else:
                        label = str(ChartService._convert_to_serializable(idx))
                    xaxis.append(label)
                
                return {
                    "xAxisData": xaxis,
                    "series": [
                        {
                            "name": measure,
                            "data": [ChartService._convert_to_serializable(v) for v in grouped[measure]],
                            "type": "bar"
                        }
                        for measure in measures
                    ]
                }
        except Exception as e:
            raise ValueError(f"Error generating bar chart: {str(e)}")
    
    @staticmethod
    def _generate_pie_chart(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate pie chart data"""
        if not dimensions or not measures:
            raise ValueError("Pie chart requires at least one dimension and one measure")
        
        # For pie, use first dimension as labels and first measure as values
        grouped = df.groupby(dimensions[0])[measures[0]].sum()
        
        return {
            "data": [
                {
                    "name": str(ChartService._convert_to_serializable(name)),
                    "value": ChartService._convert_to_serializable(value)
                }
                for name, value in grouped.items()
            ]
        }
    
    @staticmethod
    def _generate_scatter_chart(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate scatter chart data"""
        if len(dimensions) < 1 or len(measures) < 2:
            raise ValueError("Scatter chart requires at least 1 dimension and 2 measures")
        
        # Use first dimension for categories, first two measures for X and Y
        if dimensions:
            grouped = df.groupby(dimensions[0])[measures[:2]].apply(lambda x: x.values.tolist(), axis=1)
            
            data = []
            for category, points in grouped.items():
                for point in points:
                    if len(point) >= 2:
                        data.append([
                            ChartService._convert_to_serializable(point[0]),
                            ChartService._convert_to_serializable(point[1]),
                            str(ChartService._convert_to_serializable(category))
                        ])
        else:
            data = [
                [
                    ChartService._convert_to_serializable(row[measures[0]]),
                    ChartService._convert_to_serializable(row[measures[1]])
                ]
                for _, row in df.iterrows()
            ]
        
        return {
            "xAxisName": measures[0],
            "yAxisName": measures[1],
            "data": data
        }
    
    @staticmethod
    def _generate_area_chart(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate area chart data"""
        if not dimensions or not measures:
            raise ValueError("Area chart requires at least one dimension and one measure")
        
        try:
            if len(dimensions) == 1:
                grouped = df.groupby(dimensions[0])[measures].sum()
                
                return {
                    "xAxisData": [str(ChartService._convert_to_serializable(x)) for x in grouped.index],
                    "series": [
                        {
                            "name": measure,
                            "data": [ChartService._convert_to_serializable(v) for v in grouped[measure]],
                            "type": "area",
                            "areaStyle": {}
                        }
                        for measure in measures
                    ]
                }
            else:
                grouped = df.groupby(dimensions)[measures].sum()
                # Convert multi-level index to x-axis labels
                xaxis = []
                for idx in grouped.index:
                    if isinstance(idx, tuple):
                        label = "-".join(str(ChartService._convert_to_serializable(x)) for x in idx)
                    else:
                        label = str(ChartService._convert_to_serializable(idx))
                    xaxis.append(label)
                
                return {
                    "xAxisData": xaxis,
                    "series": [
                        {
                            "name": measure,
                            "data": [ChartService._convert_to_serializable(v) for v in grouped[measure]],
                            "type": "area",
                            "areaStyle": {}
                        }
                        for measure in measures
                    ]
                }
        except Exception as e:
            raise ValueError(f"Error generating area chart: {str(e)}")
    
    @staticmethod
    def _generate_histogram(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate histogram data"""
        if not measures:
            raise ValueError("Histogram requires at least one measure")
        
        measure = measures[0]
        data = df[measure].dropna().tolist()
        data = [ChartService._convert_to_serializable(v) for v in data]
        
        return {
            "data": data,
            "measure": measure,
            "binSize": "auto"
        }
    
    @staticmethod
    def _generate_box_plot(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate box plot data"""
        if not dimensions or not measures:
            raise ValueError("Box plot requires at least one dimension and one measure")
        
        measure = measures[0]
        result = []
        
        if dimensions:
            for category in df[dimensions[0]].unique():
                category_data = df[df[dimensions[0]] == category][measure].dropna().tolist()
                if category_data:
                    result.append({
                        "name": str(ChartService._convert_to_serializable(category)),
                        "data": [ChartService._convert_to_serializable(v) for v in category_data]
                    })
        else:
            data = df[measure].dropna().tolist()
            result.append({
                "name": measure,
                "data": [ChartService._convert_to_serializable(v) for v in data]
            })
        
        return {
            "data": result,
            "measure": measure
        }
    
    @staticmethod
    def _generate_table_data(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate table data"""
        columns = dimensions + measures
        if not columns:
            columns = list(df.columns)
        
        # Select only available columns
        available_cols = [col for col in columns if col in df.columns]
        if not available_cols:
            available_cols = list(df.columns)[:5]  # Default: first 5 columns
        
        selected_df = df[available_cols].head(100)  # Limit to 100 rows
        
        return {
            "columns": available_cols,
            "data": [
                {col: ChartService._convert_to_serializable(val) for col, val in row.items()}
                for row in selected_df.to_dict('records')
            ],
            "totalRows": len(df)
        }
    
    @staticmethod
    def _resolve_file_path(file_path: str) -> str:
        """Resolve file path, handling both absolute and relative paths"""
        path = Path(file_path)
        
        # If already absolute and exists, return it
        if path.is_absolute() and path.exists():
            return str(path)
        
        # Try relative to project root
        if not path.is_absolute():
            project_root = Path(__file__).parent.parent.parent.parent
            resolved = project_root / file_path
            if resolved.exists():
                return str(resolved)
        
        # Try current path as-is
        if path.exists():
            return str(path)
        
        # If we get here, file doesn't exist - raise error with debugging info
        raise FileNotFoundError(
            f"Could not find dataset file. Tried paths:\n"
            f"  1. {file_path}\n"
            f"  2. {Path(__file__).parent.parent.parent.parent / file_path if not path.is_absolute() else 'N/A'}\n"
            f"Current working directory: {Path.cwd()}"
        )
    
    @staticmethod
    async def get_dataset_columns(file_path: str) -> Dict[str, Any]:
        """Get available columns and their data types from dataset"""
        try:
            # Resolve the file path properly
            resolved_path = ChartService._resolve_file_path(file_path)
            df = ChartService._read_cleaned_dataset(resolved_path)
            
            columns = []
            for col in df.columns:
                dtype = str(df[col].dtype)
                if df[col].dtype == 'object':
                    col_type = 'text'
                elif df[col].dtype in ['int64', 'int32', 'int16', 'int8']:
                    col_type = 'number'
                elif df[col].dtype in ['float64', 'float32']:
                    col_type = 'decimal'
                elif 'datetime' in dtype:
                    col_type = 'date'
                else:
                    col_type = 'text'
                
                columns.append({
                    "name": col,
                    "type": col_type,
                    "dtype": dtype
                })
            
            return {
                "columns": columns,
                "rowCount": len(df),
                "columnCount": len(df.columns)
            }
        except FileNotFoundError as e:
            raise Exception(f"Dataset file not found: {str(e)}")
        except Exception as e:
            raise Exception(f"Error getting dataset columns: {str(e)}")
