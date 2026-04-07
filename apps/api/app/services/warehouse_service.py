# apps/api/app/services/warehouse_service.py
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from uuid import UUID
import re
from difflib import SequenceMatcher


class WarehouseService:
    """Service for handling multi-table warehouse operations"""
    
    @staticmethod
    def get_dataframe_metadata(df: pd.DataFrame, table_name: str) -> Dict[str, Any]:
        """Extract metadata from a DataFrame"""
        metadata = {
            "columns": {},
            "row_count": len(df),
            "column_count": len(df.columns),
        }
        
        for col in df.columns:
            col_type = str(df[col].dtype)
            null_count = int(df[col].isna().sum())
            
            # Sample values
            sample_values = df[col].dropna().head(5).tolist()
            
            metadata["columns"][col] = {
                "type": col_type,
                "null_count": null_count,
                "null_percentage": round((null_count / len(df)) * 100, 2),
                "sample_values": [str(v) for v in sample_values],
                "unique_count": int(df[col].nunique())
            }
        
        return metadata
    
    @staticmethod
    def detect_relationships(tables: Dict[str, pd.DataFrame]) -> List[Dict[str, Any]]:
        """Auto-detect relationships between tables based on column names and values"""
        relationships = []
        table_names = list(tables.keys())
        
        # Check each pair of tables
        for i, table1_name in enumerate(table_names):
            for table2_name in table_names[i+1:]:
                df1 = tables[table1_name]
                df2 = tables[table2_name]
                
                # Find potential join columns
                potential_joins = WarehouseService._find_join_columns(
                    df1, df2, table1_name, table2_name
                )
                
                for join in potential_joins:
                    relationships.append({
                        "from_table_name": table1_name,
                        "to_table_name": table2_name,
                        "from_column": join["col1"],
                        "to_column": join["col2"],
                        "confidence_score": join["score"],
                        "is_auto_detected": True,
                        "join_type": "left",
                        "cardinality": WarehouseService._detect_cardinality(
                            df1[join["col1"]], df2[join["col2"]]
                        )
                    })
        
        # Sort by confidence score descending
        relationships.sort(key=lambda x: x["confidence_score"], reverse=True)
        return relationships
    
    @staticmethod
    def _find_join_columns(
        df1: pd.DataFrame, df2: pd.DataFrame, 
        table1_name: str, table2_name: str
    ) -> List[Dict[str, Any]]:
        """Find potential join columns between two tables"""
        potential_joins = []
        
        # Strategy 1: Exact column name matches
        cols1 = set(df1.columns)
        cols2 = set(df2.columns)
        exact_matches = cols1 & cols2
        
        for col in exact_matches:
            # Check if values overlap significantly
            if WarehouseService._columns_compatible(df1[col], df2[col]):
                potential_joins.append({
                    "col1": col,
                    "col2": col,
                    "score": 100,
                    "method": "exact_match"
                })
        
        # Strategy 2: Similar column names (fuzzy matching)
        for col1 in df1.columns:
            for col2 in df2.columns:
                if col1 not in cols1 - cols2:  # Skip exact matches
                    similarity = SequenceMatcher(None, col1.lower(), col2.lower()).ratio()
                    
                    # If column names are similar AND values match
                    if similarity > 0.75:
                        if WarehouseService._columns_compatible(df1[col1], df2[col2]):
                            potential_joins.append({
                                "col1": col1,
                                "col2": col2,
                                "score": int(similarity * 100),
                                "method": "fuzzy_match"
                            })
        
        # Strategy 3: Common keywords (country, date, id, etc.)
        common_keywords = {
            "country": ["country", "nation", "region"],
            "date": ["date", "year", "month", "day"],
            "currency": ["currency", "currencycode", "currency_code"],
            "code": ["code", "id", "identifier"],
        }
        
        for col1 in df1.columns:
            for col2 in df2.columns:
                col1_lower = col1.lower()
                col2_lower = col2.lower()
                
                for keyword, variations in common_keywords.items():
                    if any(var in col1_lower for var in variations) and \
                       any(var in col2_lower for var in variations):
                        if WarehouseService._columns_compatible(df1[col1], df2[col2]):
                            potential_joins.append({
                                "col1": col1,
                                "col2": col2,
                                "score": 85,
                                "method": "keyword_match"
                            })
        
        # Remove duplicates and keep highest scores
        seen = set()
        unique_joins = []
        for join in sorted(potential_joins, key=lambda x: x["score"], reverse=True):
            key = (join["col1"], join["col2"])
            if key not in seen:
                seen.add(key)
                unique_joins.append(join)
        
        return unique_joins[:3]  # Return top 3 potential joins
    
    @staticmethod
    def _columns_compatible(col1: pd.Series, col2: pd.Series, min_overlap: float = 0.3) -> bool:
        """Check if two columns have compatible values for joining"""
        try:
            # Get non-null values
            vals1 = set(col1.dropna().astype(str).unique())
            vals2 = set(col2.dropna().astype(str).unique())
            
            if len(vals1) == 0 or len(vals2) == 0:
                return False
            
            # Check overlap percentage
            overlap = len(vals1 & vals2) / max(len(vals1), len(vals2))
            return overlap >= min_overlap
        except Exception:
            return False
    
    @staticmethod
    def _detect_cardinality(col1: pd.Series, col2: pd.Series) -> str:
        """Detect cardinality between two columns (1:1, 1:*, *:1, *:*)"""
        try:
            unique1 = col1.nunique()
            unique2 = col2.nunique()
            
            if unique1 == unique2:
                return "1:1"
            elif unique1 < unique2:
                return "1:*"
            else:
                return "*:1"
        except Exception:
            return "1:*"
    
    @staticmethod
    def validate_csv_files(files: List) -> Tuple[bool, List[str]]:
        """Validate that all uploaded files are CSVs"""
        errors = []
        
        for file in files:
            if not file.filename or not file.filename.lower().endswith('.csv'):
                errors.append(f"{file.filename} is not a CSV file")
                continue
        
        return len(errors) == 0, errors
    
    @staticmethod
    def extract_table_name_from_filename(filename: str) -> str:
        """Convert filename to table name (e.g., 'asia_fuel_prices_detailed.csv' -> 'asia_fuel_prices_detailed')"""
        # Remove extension
        name = filename.rsplit('.', 1)[0]
        # Convert to lowercase
        name = name.lower()
        # Replace spaces with underscores
        name = name.replace(' ', '_')
        return name
