import { AuthService } from '../auth';

export interface Filter {
  id: string;
  name: string;
  type: 'date' | 'category' | 'numeric';
  column_name: string;
  config: Record<string, any>;
}

export interface AvailableFilter {
  column_name: string;
  data_type: string;
  unique_values?: any[];
  min?: number;
  max?: number;
}

export class FilterService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  static async getAvailableFilters(datasetId: string): Promise<AvailableFilter[]> {
    const response = await fetch(
      `${FilterService.API_URL}/filters?dataset_id=${datasetId}`,
      {
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch available filters');
    }

    return response.json();
  }

  static async applyFilter(datasetId: string, filterConfig: Record<string, any>): Promise<any> {
    const response = await fetch(`${FilterService.API_URL}/filters/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        dataset_id: datasetId,
        filter_config: filterConfig,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply filter');
    }

    return response.json();
  }

  static createDateFilter(columnName: string, startDate: string, endDate: string): Record<string, any> {
    return {
      type: 'date',
      column_name: columnName,
      config: {
        start_date: startDate,
        end_date: endDate,
      },
    };
  }

  static createCategoryFilter(columnName: string, values: any[]): Record<string, any> {
    return {
      type: 'category',
      column_name: columnName,
      config: {
        values,
      },
    };
  }

  static createNumericFilter(columnName: string, min: number, max: number): Record<string, any> {
    return {
      type: 'numeric',
      column_name: columnName,
      config: {
        min,
        max,
      },
    };
  }
}
