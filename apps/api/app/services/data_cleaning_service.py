# apps/api/app/services/data_cleaning_service.py
import pandas as pd
from typing import Dict, Any, List
from pathlib import Path


async def analyze_data_quality(file_path: str, file_type: str) -> Dict[str, Any]:
    """
    Analyze dataset for data quality issues
    Returns statistics about missing values, duplicates, data types
    File type can be uppercase or lowercase
    """
    try:
        # Normalize to lowercase for comparison
        file_type_lower = file_type.lower()
        
        if file_type_lower == "csv":
            df = pd.read_csv(file_path)
        elif file_type_lower in ("xlsx", "xls"):
            df = pd.read_excel(file_path, engine=None)  # Auto-detect engine
        elif file_type_lower == "json":
            df = pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        # Analyze each column
        column_analysis = []
        for col in df.columns:
            missing_count = df[col].isnull().sum()
            missing_percent = (missing_count / len(df)) * 100
            
            # Detect data type
            inferred_type = str(df[col].dtype)
            
            column_analysis.append({
                "name": col,
                "data_type": inferred_type,
                "missing_count": int(missing_count),
                "missing_percent": round(missing_percent, 2),
                "unique_count": len(df[col].unique()),
                "sample_values": df[col].dropna().head(3).tolist()
            })
        
        # Overall stats
        duplicate_rows = df.duplicated().sum()
        total_rows = len(df)
        total_cells = len(df) * len(df.columns)
        missing_cells = df.isnull().sum().sum()
        missing_percent = (missing_cells / total_cells) * 100 if total_cells > 0 else 0
        
        return {
            "total_rows": int(total_rows),
            "total_columns": len(df.columns),
            "total_cells": int(total_cells),
            "missing_cells": int(missing_cells),
            "missing_percent": round(missing_percent, 2),
            "duplicate_rows": int(duplicate_rows),
            "columns": column_analysis,
            "quality_score": max(0, 100 - (missing_percent + (duplicate_rows / total_rows * 100)))
        }
        
    except Exception as e:
        raise Exception(f"Error analyzing data quality: {str(e)}")


async def get_column_statistics(file_path: str, file_type: str, column_name: str) -> Dict[str, Any]:
    """
    Get detailed statistics for a specific column
    File type can be uppercase or lowercase
    """
    try:
        # Normalize to lowercase for comparison
        file_type_lower = file_type.lower()
        
        if file_type_lower == "csv":
            df = pd.read_csv(file_path)
        elif file_type_lower in ("xlsx", "xls"):
            df = pd.read_excel(file_path, engine=None)  # Auto-detect engine
        elif file_type_lower == "json":
            df = pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        if column_name not in df.columns:
            raise ValueError(f"Column {column_name} not found")
        
        col = df[column_name]
        
        # Basic stats
        stats = {
            "name": column_name,
            "data_type": str(col.dtype),
            "total_values": len(col),
            "missing_values": int(col.isnull().sum()),
            "duplicate_values": int(col.duplicated().sum()),
            "unique_values": len(col.unique()),
        }
        
        # Numeric stats if applicable
        try:
            numeric_col = pd.to_numeric(col, errors='coerce')
            if numeric_col.notna().sum() > 0:
                stats.update({
                    "min": float(numeric_col.min()),
                    "max": float(numeric_col.max()),
                    "mean": float(numeric_col.mean()),
                    "median": float(numeric_col.median()),
                    "std": float(numeric_col.std())
                })
        except:
            pass
        
        # Value distribution (top 10)
        stats["top_values"] = col.value_counts().head(10).to_dict()
        
        return stats
        
    except Exception as e:
        raise Exception(f"Error analyzing column: {str(e)}")
