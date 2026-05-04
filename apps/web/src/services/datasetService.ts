// apps/web/src/services/datasetService.ts
import { getAuthClient } from '@/lib/apiClient';
import {
  Dataset,
  DatasetCreate,
  DatabaseConnectionTest,
  DatabaseConnectionTestResponse,
  ActiveDatabaseConnectionSet,
  ActiveDatabaseConnectionResponse,
  DatabaseQueryRequest,
  DatabaseQueryHistoryResponse,
} from '@/types/dataset';

class DatasetService {
  private getClient() {
    return getAuthClient();
  }

  async createDatasetFromDatabase(data: DatasetCreate): Promise<Dataset> {
    const response = await this.getClient().post<Dataset>('/datasets', data);
    return response.data;
  }

  async getActiveDatabaseConnection(): Promise<ActiveDatabaseConnectionResponse> {
    const response = await this.getClient().get<ActiveDatabaseConnectionResponse>('/datasets/db-connection');
    return response.data;
  }

  async setActiveDatabaseConnection(data: ActiveDatabaseConnectionSet): Promise<ActiveDatabaseConnectionResponse> {
    const response = await this.getClient().post<ActiveDatabaseConnectionResponse>('/datasets/db-connection', data);
    return response.data;
  }

  async clearActiveDatabaseConnection(): Promise<void> {
    await this.getClient().delete('/datasets/db-connection');
  }

  async testActiveDatabaseQuery(data: DatabaseQueryRequest): Promise<DatabaseConnectionTestResponse> {
    const response = await this.getClient().post<DatabaseConnectionTestResponse>('/datasets/db-connection/test-query', data);
    return response.data;
  }

  async getDatabaseQueryHistory(): Promise<DatabaseQueryHistoryResponse> {
    const response = await this.getClient().get<DatabaseQueryHistoryResponse>('/datasets/db-connection/query-history');
    return response.data;
  }

  async clearDatabaseQueryHistory(): Promise<void> {
    await this.getClient().delete('/datasets/db-connection/query-history');
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
