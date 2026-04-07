# apps/api/app/services/data_operations_service.py
"""
Data operations and transformation service
Implements pandas-based transformations for data cleaning and manipulation
Similar to PowerBI's Power Query approach
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime
import json


class DataOperationsService:
    """Service for applying data transformations and cleaning operations"""
    
    @staticmethod
    def load_dataframe(file_path: str, file_type: str) -> pd.DataFrame:
        """Load a file into a pandas DataFrame"""
        try:
            # Normalize to lowercase for comparison
            file_type_lower = file_type.lower()
            
            if file_type_lower == "csv":
                return pd.read_csv(file_path)
            elif file_type_lower in ("xlsx", "xls"):
                return pd.read_excel(file_path, sheet_name=0)
            elif file_type_lower == "json":
                return pd.read_json(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            raise Exception(f"Failed to load dataframe: {str(e)}")
    
    @staticmethod
    def save_dataframe(df: pd.DataFrame, file_path: str, file_type: str) -> None:
        """Save a DataFrame to a file"""
        try:
            # Normalize to lowercase for comparison
            file_type_lower = file_type.lower()
            
            if file_type_lower == "csv":
                df.to_csv(file_path, index=False)
            elif file_type_lower in ("xlsx", "xls"):
                df.to_excel(file_path, index=False, sheet_name="Sheet1")
            elif file_type_lower == "json":
                df.to_json(file_path, orient="records", indent=2)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            raise Exception(f"Failed to save dataframe: {str(e)}")
    
    @staticmethod
    def apply_operations(
        file_path: str, 
        file_type: str, 
        operations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Apply a sequence of cleaning/transformation operations to a dataset
        
        Operations format:
        [
            {
                "type": "rename_column",
                "params": {"old_name": "col1", "new_name": "Column 1"}
            },
            {
                "type": "change_type",
                "params": {"column": "Column 1", "new_type": "number"}
            },
            {
                "type": "remove_duplicates",
                "params": {}
            },
            {
                "type": "fill_missing",
                "params": {"column": "col2", "method": "forward_fill"}
            },
            {
                "type": "remove_rows",
                "params": {"column": "col1", "condition": "null"}
            }
        ]
        """
        try:
            df = DataOperationsService.load_dataframe(file_path, file_type)
            original_shape = df.shape
            
            # Track transformations
            transformations_applied = []
            
            for operation in operations:
                op_type = operation.get("type")
                params = operation.get("params", {})
                
                if op_type == "rename_column":
                    df = DataOperationsService._rename_column(df, params)
                    transformations_applied.append(f"Renamed '{params['old_name']}' to '{params['new_name']}'")
                
                elif op_type == "change_type":
                    df = DataOperationsService._change_column_type(df, params)
                    transformations_applied.append(f"Changed '{params['column']}' type to {params['new_type']}")
                
                elif op_type == "remove_column":
                    df = DataOperationsService._remove_column(df, params)
                    transformations_applied.append(f"Removed column '{params['column']}'")
                
                elif op_type == "remove_duplicates":
                    df = DataOperationsService._remove_duplicates(df, params)
                    transformations_applied.append("Removed duplicate rows")
                
                elif op_type == "fill_missing":
                    df = DataOperationsService._fill_missing_values(df, params)
                    transformations_applied.append(f"Filled missing values in '{params['column']}'")
                
                elif op_type == "remove_rows":
                    df = DataOperationsService._remove_rows(df, params)
                    transformations_applied.append(f"Removed rows with condition")
                
                elif op_type == "replace_value":
                    df = DataOperationsService._replace_value(df, params)
                    transformations_applied.append(f"Replaced values in '{params['column']}'")
                
                elif op_type == "sort_column":
                    df = DataOperationsService._sort_by_column(df, params)
                    transformations_applied.append(f"Sorted by '{params['column']}'")
                
                elif op_type == "filter_rows":
                    df = DataOperationsService._filter_rows(df, params)
                    transformations_applied.append(f"Filtered rows")
            
            final_shape = df.shape
            
            return {
                "success": True,
                "before": {
                    "rows": original_shape[0],
                    "columns": original_shape[1]
                },
                "after": {
                    "rows": final_shape[0],
                    "columns": final_shape[1]
                },
                "transformations_applied": transformations_applied,
                "columns": df.columns.tolist(),
                "sample_data": df.head(10).values.tolist() if len(df) > 0 else [],
                "dataframe": df  # Return the actual dataframe for saving
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def _rename_column(df: pd.DataFrame, params: Dict) -> pd.DataFrame:
        """Rename a column"""
        old_name = params.get("old_name")
        new_name = params.get("new_name")
        
        if old_name not in df.columns:
            raise ValueError(f"Column '{old_name}' not found")
        
        return df.rename(columns={old_name: new_name})
    
    @staticmethod
    def _change_column_type(df: pd.DataFrame, params: Dict) -> pd.DataFrame:
        """Change data type of a column"""
        column = params.get("column")
        new_type = params.get("new_type")
        
        if column not in df.columns:
            raise ValueError(f"Column '{column}' not found")
        
        try:
            if new_type == "number" or new_type == "int":
                df[column] = pd.to_numeric(df[column], errors='coerce')
            elif new_type == "float":
                df[column] = df[column].astype(float, errors='ignore')
            elif new_type == "string" or new_type == "text":
                df[column] = df[column].astype(str)
            elif new_type == "date":
                df[column] = pd.to_datetime(df[column], errors='coerce')
            elif new_type == "boolean" or new_type == "bool":
                df[column] = df[column].astype(bool, errors='ignore')
            else:
                df[column] = df[column].astype(new_type)
            
            return df
        except Exception as e:
            raise ValueError(f"Failed to convert '{column}' to {new_type}: {str(e)}")
    
    @staticmethod
    def _remove_column(df: pd.DataFrame, params: Dict) -> pd.DataFrame:
        """Remove a column from the dataframe"""
        column = params.get("column")
        
        if column not in df.columns:
            raise ValueError(f"Column '{column}' not found")
        
        return df.drop(columns=[column])
    
    @staticmethod
    def _remove_duplicates(df: pd.DataFrame, params: Dict) -> pd.DataFrame:
        """Remove duplicate rows"""
        subset = params.get("subset")  # Optional: specific columns only
        keep = params.get("keep", "first")  # first, last, or False (remove all)
        
        if subset:
            return df.drop_duplicates(subset=subset, keep=keep)
        else:
            return df.drop_duplicates(keep=keep)
    
    @staticmethod
    def _fill_missing_values(df: pd.DataFrame, params: Dict) -> pd.DataFrame:
        """Fill missing values in a column"""
        column = params.get("column")
        method = params.get("method", "forward_fill")  # forward_fill, backward_fill, mean, median, value
        value = params.get("value")  # For 'value' method
        
        if column not in df.columns:
            raise ValueError(f"Column '{column}' not found")
        
        if method == "forward_fill":
            df[column] = df[column].fillna(method='ffill')
        elif method == "backward_fill":
            df[column] = df[column].fillna(method='bfill')
        elif method == "mean":
            mean_val = df[column].mean()
            df[column] = df[column].fillna(mean_val)
        elif method == "median":
            median_val = df[column].median()
            df[column] = df[column].fillna(median_val)
        elif method == "value":
            if value is None:
                raise ValueError("Must provide 'value' parameter for 'value' method")
            df[column] = df[column].fillna(value)
        
        return df
    
    @staticmethod
    def _remove_rows(df: pd.DataFrame, params: Dict) -> pd.DataFrame:
        """Remove rows based on condition"""
        column = params.get("column")
        condition = params.get("condition")  # "null", "not_null", "empty", "not_empty"
        
        if column not in df.columns:
            raise ValueError(f"Column '{column}' not found")
        
        if condition == "null" or condition == "empty":
            return df[df[column].notna()]
        elif condition == "not_null" or condition == "not_empty":
            return df[df[column].isna()]
        
        return df
    
    @staticmethod
    def _replace_value(df: pd.DataFrame, params: Dict) -> pd.DataFrame:
        """Replace values in a column"""
        column = params.get("column")
        old_value = params.get("old_value")
        new_value = params.get("new_value")
        
        if column not in df.columns:
            raise ValueError(f"Column '{column}' not found")
        
        df[column] = df[column].replace(old_value, new_value)
        
        return df
    
    @staticmethod
    def _sort_by_column(df: pd.DataFrame, params: Dict) -> pd.DataFrame:
        """Sort dataframe by column"""
        column = params.get("column")
        ascending = params.get("ascending", True)
        
        if column not in df.columns:
            raise ValueError(f"Column '{column}' not found")
        
        return df.sort_values(by=column, ascending=ascending)
    
    @staticmethod
    def _filter_rows(df: pd.DataFrame, params: Dict) -> pd.DataFrame:
        """Filter rows based on a condition"""
        filters = params.get("filters")  # List of {'column': str, 'operator': str, 'value': any}
        
        for filt in filters:
            column = filt.get("column")
            operator = filt.get("operator")  # ==, !=, <, >, <=, >=, contains, not_contains
            value = filt.get("value")
            
            if column not in df.columns:
                raise ValueError(f"Column '{column}' not found")
            
            if operator == "==":
                df = df[df[column] == value]
            elif operator == "!=":
                df = df[df[column] != value]
            elif operator == "<":
                df = df[df[column] < value]
            elif operator == ">":
                df = df[df[column] > value]
            elif operator == "<=":
                df = df[df[column] <= value]
            elif operator == ">=":
                df = df[df[column] >= value]
            elif operator == "contains":
                df = df[df[column].astype(str).str.contains(str(value), case=False)]
            elif operator == "not_contains":
                df = df[~df[column].astype(str).str.contains(str(value), case=False)]
        
        return df


# Convenience function for common operations
async def apply_cleaning_operations(
    dataset_id: str,
    file_path: str,
    file_type: str,
    operations: List[Dict[str, Any]],
    output_path: str
) -> Dict[str, Any]:
    """
    Apply cleaning operations and save the result
    """
    try:
        result = DataOperationsService.apply_operations(file_path, file_type, operations)
        
        if result.get("success"):
            # Save the cleaned dataframe
            df = result.pop("dataframe")
            DataOperationsService.save_dataframe(df, output_path, file_type)
            
            result["message"] = "Cleaning operations applied successfully"
            return result
        else:
            return result
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to apply cleaning operations: {str(e)}"
        }
