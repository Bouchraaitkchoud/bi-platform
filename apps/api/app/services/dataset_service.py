# apps/api/app/services/dataset_service.py
import pandas as pd
import numpy as np
from typing import Dict, Any
import asyncio
import uuid


def _extract_metadata_sync(file_path: str, file_type_lower: str) -> Dict[str, Any]:
    if file_type_lower == "csv":
        df = pd.read_csv(file_path)
    elif file_type_lower in ("xlsx", "xls"):
        df = pd.read_excel(file_path, engine=None)
    elif file_type_lower == "json":
        df = pd.read_json(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type_lower}")
    
    columns_metadata = {
        "columns": [
            {
                "name": str(col),
                "type": str(df[col].dtype),
                "null_count": int(df[col].isna().sum()),
                "unique_count": int(df[col].nunique()),
            }
            for col in df.columns
        ]
    }
    
    return {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns_metadata": columns_metadata,
        "file_size": 0
    }

async def extract_dataset_metadata(file_path: str, file_type: str) -> Dict[str, Any]:
    """
    Extract metadata from a dataset file
    Supports: CSV, Excel (.xls, .xlsx), JSON
    File types can be uppercase or lowercase
    """
    try:
        file_type_lower = file_type.lower()
        return await asyncio.to_thread(_extract_metadata_sync, file_path, file_type_lower)
    except Exception as e:
        raise Exception(f"Error extracting metadata: {str(e)}")


def _get_preview_sync(file_path: str, file_type_lower: str, limit: int) -> Dict[str, Any]:
    if file_type_lower == "csv":
        df = pd.read_csv(file_path, nrows=limit)
    elif file_type_lower in ("xlsx", "xls"):
        df = pd.read_excel(file_path, nrows=limit, engine=None)
    elif file_type_lower == "json":
        df = pd.read_json(file_path)
        df = df.head(limit)
    else:
        raise ValueError(f"Unsupported file type: {file_type_lower}")
    
    # Fast NaN to None conversion and dictionary serialization
    df = df.replace({np.nan: None})
    data = df.to_dict(orient="records")
    
    return {
        "columns": list(df.columns),
        "data": data,
        "row_count": len(df),
        "column_count": len(df.columns)
    }

async def get_dataset_preview(file_path: str, file_type: str, limit: int = 100000):
    """
    Get a preview of dataset data
    Supports: CSV, Excel (.xls, .xlsx), JSON
    File types can be uppercase or lowercase
    """
    try:
        file_type_lower = file_type.lower()
        return await asyncio.to_thread(_get_preview_sync, file_path, file_type_lower, limit)
    except Exception as e:
        raise Exception(f"Error getting preview: {str(e)}")
