// apps/web/src/services/datasetService.ts
import { getAuthClient } from '@/lib/apiClient';
import { Dataset, DatasetCreate, DatabaseConnectionTest, DatabaseConnectionTestResponse } from '@/types/dataset';

class DatasetService {
  private getClient() {
    return getAuthClient();
  }

  async createDatasetFromDatabase(data: DatasetCreate): Promise<Dataset> {
    const response = await this.getClient().post<Dataset>('/datasets', data);
    return response.data;
  }

  async testDatabaseConnection(data: DatabaseConnectionTest): Promise<DatabaseConnectionTestResponse> {
    const response = await this.getClient().post<DatabaseConnectionTestResponse>('/datasets/test-db-connection', data);
    return response.data;
  }

  async listDatasets(): Promise<Dataset[]> {
    const response = await this.getClient().get<Dataset[]>('/datasets');
    return response.data;
  }
  
  async getDataset(id: string): Promise<Dataset> {
    const response = await this.getClient().get<Dataset>(`/datasets/${id}`);
    return response.data;
  }
}

export const datasetService = new DatasetService();
