import { AuthService } from '../auth';

export interface Dataset {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  original_file: string;
  file_type: string;
  row_count: number;
  column_count: number;
  columns_metadata: Record<string, any>;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface DatasetPreview {
  data: any[];
  columns: string[];
  row_count: number;
  column_count: number;
  column_metadata: Record<string, any>;
}

export interface ColumnStatistics {
  column_name: string;
  data_type: string;
  null_count: number;
  unique_count: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std_dev?: number;
  value_distribution?: Record<string, number>;
}

export class DatasetService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  static async createDataset(name: string, description: string, file_type: string): Promise<Dataset> {
    const response = await fetch(`${DatasetService.API_URL}/datasets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        name,
        description,
        file_type,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create dataset');
    }

    return response.json();
  }

  static async uploadFile(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${DatasetService.API_URL}/datasets/upload/file`, {
      method: 'POST',
      headers: AuthService.getAuthHeader(),
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload file');
    }

    return response.json();
  }

  static async listDatasets(skip = 0, limit = 10): Promise<Dataset[]> {
    const response = await fetch(
      `${DatasetService.API_URL}/datasets?skip=${skip}&limit=${limit}`,
      {
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch datasets');
    }

    return response.json();
  }

  static async getDataset(datasetId: string): Promise<Dataset> {
    const response = await fetch(`${DatasetService.API_URL}/datasets/${datasetId}`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dataset');
    }

    return response.json();
  }

  static async getDatasetPreview(datasetId: string, limit = 100): Promise<DatasetPreview> {
    const response = await fetch(
      `${DatasetService.API_URL}/datasets/${datasetId}/preview?limit=${limit}`,
      {
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch dataset preview');
    }

    return response.json();
  }

  static async getColumnStatistics(datasetId: string, columns?: string[]): Promise<ColumnStatistics[]> {
    const url = new URL(`${DatasetService.API_URL}/datasets/${datasetId}/statistics`);
    if (columns) {
      url.searchParams.append('columns', columns.join(','));
    }

    const response = await fetch(url.toString(), {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch column statistics');
    }

    return response.json();
  }

  static async analyzeDataQuality(datasetId: string): Promise<any> {
    const response = await fetch(
      `${DatasetService.API_URL}/datasets/${datasetId}/quality`,
      {
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to analyze data quality');
    }

    return response.json();
  }

  static async deleteDataset(datasetId: string): Promise<void> {
    const response = await fetch(`${DatasetService.API_URL}/datasets/${datasetId}`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete dataset');
    }
  }

  static async updateDataset(datasetId: string, name: string, description: string): Promise<Dataset> {
    const response = await fetch(`${DatasetService.API_URL}/datasets/${datasetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        name,
        description,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update dataset');
    }

    return response.json();
  }

  static async exportDatasetAsCSV(datasetId: string): Promise<Blob> {
    const response = await fetch(`${DatasetService.API_URL}/datasets/${datasetId}/export/csv`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to export dataset');
    }

    return response.blob();
  }
}
