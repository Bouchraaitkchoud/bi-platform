# apps/api/app/services/dataset_service.py
import pandas as pd
import numpy as np
from typing import Dict, Any
import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.exc import SQLAlchemyError
from typing import Dict, Any, Tuple, List
from app.core.security import decrypt_value, is_encrypted_value


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


async def test_db_connection(details: Dict[str, Any], query: str) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Tests a database connection and executes a query to return a preview.
    """
    connection_string = None
    conn = None
    try:
        db_type = details.get("db_type", "postgresql")
        user = details["user"]
        password = details.get("password")
        if not password and details.get("password_enc"):
            password = details.get("password_enc")

        if password and is_encrypted_value(password):
            password = decrypt_value(password)
        if not password:
            raise ValueError("Database password is required")
        host = details["host"]
        port = int(details["port"])
        dbname = details["dbname"]

        if db_type == "postgresql":
            # Ensure asyncpg is installed
            try:
                import asyncpg
            except ImportError:
                raise ImportError("Required database driver is not installed. Please run 'pip install asyncpg'.")
            
            # Connect using asyncpg directly
            conn = await asyncpg.connect(
                user=user,
                password=password,
                database=dbname,
                host=host,
                port=port
            )
            
            # Execute the query
            preview_query = f"SELECT * FROM ({query.strip(';')}) AS sub_query LIMIT 10"
            rows = await conn.fetch(preview_query)
            
            # Get column names
            if rows:
                columns = list(rows[0].keys())
                data = [dict(row) for row in rows]
            else:
                columns = []
                data = []
            
            preview_data = {
                "columns": columns,
                "data": data
            }
            
            await conn.close()
            return True, "Connection successful and query executed.", preview_data
        else:
            return False, f"Database type '{db_type}' is not supported.", {}

    except ImportError as e:
        return False, str(e), {}
    except Exception as e:
        error_msg = str(e)
        # Check for common errors
        if "authentication failed" in error_msg.lower() or "password" in error_msg.lower():
            return False, f"Authentication failed: {error_msg}", {}
        elif "does not exist" in error_msg.lower() or "unknown database" in error_msg.lower():
            return False, f"Database not found: {error_msg}", {}
        else:
            return False, f"Database connection failed: {error_msg}", {}
    finally:
        if conn:
            try:
                await conn.close()
            except:
                pass
