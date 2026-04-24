import { AuthService } from '../auth';

export interface WarehouseImportResponse {
  warehouse_id: string;
  warehouse_name: string;
  table_count: number;
  tables: Array<{
    table_name: string;
    row_count: number;
    column_count: number;
  }>;
}

export interface WarehouseDetails {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  table_count: number;
  tables: Array<{
    id: string;
    table_name?: string;
    name?: string;
    row_count: number;
    column_count: number;
    columns_metadata?: Record<
      string,
      {
        type: string;
        null_count?: number;
        sample_values?: any[];
      }
    >;
    file_size?: number;
    is_processed?: boolean;
    created_at: string;
  }>;
  relationships: Array<{
    id: string;
    from_table_name: string;
    to_table_name: string;
    from_column: string;
    to_column: string;
    cardinality: string;
    join_type: string;
    is_auto_detected: boolean;
    confidence_score?: number;
  }>;
  created_at: string;
  updated_at: string;
}

export class WarehouseService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  static async importMultipleTables(
    warehouseName: string,
    warehouseDescription: string,
    files: File[]
  ): Promise<WarehouseImportResponse> {
    const formData = new FormData();
    formData.append('warehouse_name', warehouseName);
    formData.append('warehouse_description', warehouseDescription);

    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${WarehouseService.API_URL}/warehouses/import-multi`, {
      method: 'POST',
      headers: AuthService.getAuthHeader(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to import warehouse');
    }

    return response.json();
  }

  static async getWarehouse(warehouseId: string): Promise<WarehouseDetails> {
    const response = await fetch(`${WarehouseService.API_URL}/warehouses/${warehouseId}`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch warehouse');
    }

    return response.json();
  }

  static async listWarehouses(skip = 0, limit = 10) {
    const response = await fetch(`${WarehouseService.API_URL}/warehouses?skip=${skip}&limit=${limit}`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch warehouses');
    }

    return response.json();
  }

  static async deleteWarehouse(warehouseId: string) {
    const response = await fetch(`${WarehouseService.API_URL}/warehouses/${warehouseId}`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete warehouse');
    }

    return response.json();
  }

  static async getTablePreview(warehouseId: string, tableName: string, limit = 1000) {
    const response = await fetch(
      `${WarehouseService.API_URL}/warehouses/${warehouseId}/tables/${tableName}/preview?limit=${limit}`,
      {
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch table preview');
    }

    return response.json();
  }
}
