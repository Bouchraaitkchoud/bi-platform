# apps/api/app/services/dataset_service.py
import pandas as pd
from typing import Dict, Any
import uuid


async def extract_dataset_metadata(file_path: str, file_type: str) -> Dict[str, Any]:
    """
    Extract metadata from a dataset file
    Supports: CSV, Excel (.xls, .xlsx), JSON
    File types can be uppercase or lowercase
    """
    try:
        # Normalize to lowercase for comparison
        file_type_lower = file_type.lower()
        
        if file_type_lower == "csv":
            df = pd.read_csv(file_path)
        elif file_type_lower in ("xlsx", "xls"):
            # Handle both Excel formats
            # pandas automatically detects format from extension
            df = pd.read_excel(file_path, engine=None)
        elif file_type_lower == "json":
            df = pd.read_json(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        # Extract column information
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
            "file_size": 0  # Will be set separately
        }
        
    except Exception as e:
        raise Exception(f"Error extracting metadata: {str(e)}")


async def get_dataset_preview(file_path: str, file_type: str, limit: int = 100000):
    """
    Get a preview of dataset data
    Supports: CSV, Excel (.xls, .xlsx), JSON
    File types can be uppercase or lowercase
    """
    try:
        # Normalize to lowercase for comparison
        file_type_lower = file_type.lower()
        
        if file_type_lower == "csv":
            df = pd.read_csv(file_path, nrows=limit)
        elif file_type_lower in ("xlsx", "xls"):
            # Handle both Excel formats
            # pandas automatically detects format from extension
            df = pd.read_excel(file_path, nrows=limit, engine=None)
        elif file_type_lower == "json":
            df = pd.read_json(file_path)
            df = df.head(limit)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        # Convert dataframe to list of lists, handling NaN values
        sample_data = []
        for _, row in df.iterrows():
            sample_data.append(row.fillna(None).tolist())
        
        return {
            "columns": list(df.columns),
            "sample_data": sample_data,
            "row_count": len(df),
            "column_count": len(df.columns)
        }
        
    except Exception as e:
        raise Exception(f"Error getting preview: {str(e)}")
