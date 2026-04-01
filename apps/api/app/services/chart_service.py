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
            elif chart_type == 'donut':
                chart_data = ChartService._generate_donut_chart(df, dimensions, measures)
            elif chart_type == 'scatter':
                chart_data = ChartService._generate_scatter_chart(df, dimensions, measures)
            elif chart_type == 'bubble':
                chart_data = ChartService._generate_bubble_chart(df, dimensions, measures)
            elif chart_type == 'area':
                chart_data = ChartService._generate_area_chart(df, dimensions, measures)
            elif chart_type == 'combo':
                chart_data = ChartService._generate_combo_chart(df, dimensions, measures)
            elif chart_type == 'histogram':
                chart_data = ChartService._generate_histogram(df, dimensions, measures)
            elif chart_type == 'box':
                chart_data = ChartService._generate_box_plot(df, dimensions, measures)
            elif chart_type == 'kpi_card':
                chart_data = ChartService._generate_kpi_card(df, dimensions, measures)
            elif chart_type == 'gauge':
                chart_data = ChartService._generate_gauge(df, dimensions, measures)
            elif chart_type == 'treemap':
                chart_data = ChartService._generate_treemap(df, dimensions, measures)
            elif chart_type == 'waterfall':
                chart_data = ChartService._generate_waterfall(df, dimensions, measures)
            elif chart_type == 'funnel':
                chart_data = ChartService._generate_funnel(df, dimensions, measures)
            elif chart_type == 'heatmap':
                chart_data = ChartService._generate_heatmap(df, dimensions, measures)
            elif chart_type == 'table':
                chart_data = ChartService._generate_table_data(df, dimensions, measures)
            elif chart_type == 'matrix':
                chart_data = ChartService._generate_matrix(df, dimensions, measures)
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
    def _generate_donut_chart(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate donut chart data (similar to pie with hole in center)"""
        if not dimensions or not measures:
            raise ValueError("Donut chart requires at least one dimension and one measure")
        
        dim = dimensions[0]
        meas = measures[0]
        grouped = df.groupby(dim)[meas].sum().reset_index()
        
        return {
            "name": meas,
            "data": [
                {"name": str(row[dim]), "value": ChartService._convert_to_serializable(row[meas])}
                for _, row in grouped.iterrows()
            ]
        }

    @staticmethod
    def _generate_kpi_card(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate KPI card data (single metric with optional comparison)"""
        if not measures:
            raise ValueError("KPI card requires at least one measure")
        
        meas = measures[0]
        # Get numeric values only
        numeric_values = pd.to_numeric(df[meas], errors='coerce').dropna()
        
        if len(numeric_values) == 0:
            raise ValueError(f"No numeric values found in measure '{meas}'")
        
        total = ChartService._convert_to_serializable(numeric_values.sum())
        avg = ChartService._convert_to_serializable(numeric_values.mean())
        max_val = ChartService._convert_to_serializable(numeric_values.max())
        
        return {
            "value": total,
            "average": avg,
            "max": max_val,
            "trend": "up"
        }

    @staticmethod
    def _generate_gauge(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate gauge chart data (speedometer style)"""
        if not measures:
            raise ValueError("Gauge requires at least one measure")
        
        meas = measures[0]
        # Get numeric values only
        numeric_values = pd.to_numeric(df[meas], errors='coerce').dropna()
        
        if len(numeric_values) == 0:
            raise ValueError(f"No numeric values found in measure '{meas}'")
        
        value = ChartService._convert_to_serializable(numeric_values.mean())
        max_val = ChartService._convert_to_serializable(numeric_values.max())
        
        if max_val == 0:
            max_val = 100
        
        return {
            "value": value,
            "max": max_val,
            "min": 0,
            "thresholds": [
                {"color": "#27AE60", "value": max_val * 0.33},  # Green
                {"color": "#F39C12", "value": max_val * 0.66},  # Yellow
                {"color": "#E74C3C", "value": max_val}  # Red
            ]
        }

    @staticmethod
    def _generate_combo_chart(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate combo chart (line + bar combined)"""
        if not dimensions or len(measures) < 1:
            raise ValueError("Combo chart requires at least one dimension and one measure")
        
        dim = dimensions[0]
        grouped = df.groupby(dim)[measures].sum().reset_index()
        
        series = []
        for i, meas in enumerate(measures):
            if i == 0:
                series.append({
                    "name": meas,
                    "type": "bar",
                    "data": [ChartService._convert_to_serializable(val) for val in grouped[meas]]
                })
            else:
                series.append({
                    "name": meas,
                    "type": "line",
                    "data": [ChartService._convert_to_serializable(val) for val in grouped[meas]]
                })
        
        return {
            "xAxisData": [str(val) for val in grouped[dim]],
            "series": series
        }

    @staticmethod
    def _generate_bubble_chart(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate bubble chart (scatter with size dimension)"""
        if len(measures) < 2:
            raise ValueError("Bubble chart requires at least 2 measures")
        
        x_meas = measures[0]
        y_meas = measures[1]
        z_meas = measures[2] if len(measures) > 2 else measures[0]
        
        # Remove NaN values
        clean_df = df[[x_meas, y_meas, z_meas]].dropna()
        if len(clean_df) == 0:
            raise ValueError("No valid data for bubble chart")
        
        # Normalize bubble size
        max_z = float(clean_df[z_meas].max())
        min_z = float(clean_df[z_meas].min())
        z_range = max_z - min_z if max_z != min_z else 1
        
        series_data = []
        for _, row in clean_df.iterrows():
            x_val = ChartService._convert_to_serializable(row[x_meas])
            y_val = ChartService._convert_to_serializable(row[y_meas])
            z_val = float(row[z_meas])
            size = (z_val - min_z) / z_range * 50 + 5
            series_data.append([x_val, y_val, size])
        
        return {
            "xAxisName": x_meas,
            "yAxisName": y_meas,
            "data": series_data
        }

    @staticmethod
    def _generate_treemap(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate treemap (hierarchical rectangles)"""
        if not dimensions or not measures:
            raise ValueError("Treemap requires at least one dimension and one measure")
        
        dim = dimensions[0]
        meas = measures[0]
        grouped = df.groupby(dim)[meas].sum().reset_index()
        
        return {
            "data": [
                {
                    "name": str(row[dim]),
                    "value": ChartService._convert_to_serializable(row[meas])
                }
                for _, row in grouped.iterrows()
            ]
        }

    @staticmethod
    def _generate_waterfall(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate waterfall chart (sequential changes)"""
        if not dimensions or not measures:
            raise ValueError("Waterfall requires at least one dimension and one measure")
        
        dim = dimensions[0]
        meas = measures[0]
        grouped = df.groupby(dim)[meas].sum().reset_index().head(10)  # Limit to 10 categories
        
        values = [ChartService._convert_to_serializable(val) for val in grouped[meas]]
        
        return {
            "categories": [str(val) for val in grouped[dim]],
            "values": values,
            "cumulative": list(pd.Series(values).cumsum())
        }

    @staticmethod
    def _generate_funnel(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate funnel chart (conversion flow)"""
        if not dimensions or not measures:
            raise ValueError("Funnel requires at least one dimension and one measure")
        
        dim = dimensions[0]
        meas = measures[0]
        grouped = df.groupby(dim)[meas].sum().reset_index().sort_values(meas, ascending=False).head(8)
        
        return {
            "data": [
                {
                    "name": str(row[dim]),
                    "value": ChartService._convert_to_serializable(row[meas])
                }
                for _, row in grouped.iterrows()
            ]
        }

    @staticmethod
    def _generate_heatmap(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate heatmap (matrix with color intensity)"""
        if len(dimensions) < 2 or not measures:
            raise ValueError("Heatmap requires at least 2 dimensions and 1 measure")
        
        dim1 = dimensions[0]
        dim2 = dimensions[1]
        meas = measures[0]
        
        try:
            pivot_table = df.pivot_table(values=meas, index=dim1, columns=dim2, aggfunc='sum').fillna(0)
            
            if pivot_table.empty:
                raise ValueError("No data available for heatmap")
            
            data = []
            for i in range(len(pivot_table.index)):
                for j in range(len(pivot_table.columns)):
                    data.append([
                        i,
                        j,
                        ChartService._convert_to_serializable(pivot_table.iloc[i, j])
                    ])
            
            return {
                "rows": [str(idx) for idx in pivot_table.index],
                "columns": [str(col) for col in pivot_table.columns],
                "data": data
            }
        except Exception as e:
            raise ValueError(f"Error creating heatmap: {str(e)}")

    @staticmethod
    def _generate_matrix(df: pd.DataFrame, dimensions: List[str], measures: List[str]) -> Dict[str, Any]:
        """Generate matrix/pivot table with multiple measures"""
        if not dimensions or not measures:
            return ChartService._generate_table_data(df, dimensions, measures)
        
        # Create pivot table
        try:
            if len(dimensions) > 1:
                pivot_table = df.pivot_table(values=measures, index=dimensions[0], 
                                            columns=dimensions[1], aggfunc='sum')
            else:
                pivot_table = df.pivot_table(values=measures, index=dimensions[0], aggfunc='sum')
            
            if pivot_table.empty:
                return ChartService._generate_table_data(df, dimensions, measures)
            
            # Flatten column names if multi-level
            if isinstance(pivot_table.columns, pd.MultiIndex):
                pivot_table.columns = ['_'.join(col).strip() for col in pivot_table.columns.values]
            else:
                pivot_table.columns = [str(col) for col in pivot_table.columns]
            
            return {
                "columns": list(pivot_table.columns),
                "rows": [str(idx) for idx in pivot_table.index],
                "data": [
                    {str(col): ChartService._convert_to_serializable(pivot_table.iloc[i][col]) 
                     for col in pivot_table.columns}
                    for i in range(len(pivot_table))
                ]
            }
        except Exception as e:
            # Fallback to regular table if pivot fails
            return ChartService._generate_table_data(df, dimensions, measures)
    
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
