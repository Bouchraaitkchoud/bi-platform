// apps/web/src/types/dataset.ts

export type SourceType = "FILE" | "WAREHOUSE" | "DATABASE";
export type FileType = "CSV" | "XLSX" | "XLS" | "JSON" | "DATABASE";

export interface Dataset {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  source_type: SourceType;
  original_file?: string;
  file_type?: FileType;
  sql_query?: string;
  row_count: number;
  column_count: number;
  columns_metadata: Record<string, any>;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface DatasetCreate {
  name: string;
  description?: string;
  source_type: 'DATABASE';
  db_connection_details: Record<string, any>;
  sql_query: string;
}

export interface DatabaseConnectionTest {
    db_connection_details: Record<string, any>;
    sql_query: string;
}

export interface DatabaseConnectionTestResponse {
    message: string;
    preview_data: {
        columns: string[];
        data: any[][];
    }
}
