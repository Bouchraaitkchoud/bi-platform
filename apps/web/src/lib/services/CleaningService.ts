import { AuthService } from '../auth';

export interface Transformation {
  id: string;
  dataset_id: string;
  step_order: number;
  operation: string;
  parameters: Record<string, any>;
  created_at: string;
}

export interface DataQualityAnalysis {
  null_counts: Record<string, number>;
  duplicate_rows: number;
  column_unique_counts: Record<string, number>;
  data_types: Record<string, string>;
  issues: string[];
}

export class CleaningService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  static async analyzeDataQuality(datasetId: string): Promise<DataQualityAnalysis> {
    const response = await fetch(
      `${CleaningService.API_URL}/datasets/${datasetId}/quality-analysis`,
      {
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to analyze data quality');
    }

    return response.json();
  }

  static async dropNulls(datasetId: string, columns: string[]): Promise<Transformation> {
    const response = await fetch(`${CleaningService.API_URL}/datasets/${datasetId}/transformations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        operation: 'drop_nulls',
        parameters: { columns },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply drop nulls transformation');
    }

    return response.json();
  }

  static async dropDuplicates(
    datasetId: string,
    columns?: string[]
  ): Promise<Transformation> {
    const response = await fetch(`${CleaningService.API_URL}/datasets/${datasetId}/transformations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        operation: 'drop_duplicates',
        parameters: { columns: columns || [] },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply drop duplicates transformation');
    }

    return response.json();
  }

  static async renameColumn(datasetId: string, oldName: string, newName: string): Promise<Transformation> {
    const response = await fetch(`${CleaningService.API_URL}/datasets/${datasetId}/transformations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        operation: 'rename_column',
        parameters: { old_name: oldName, new_name: newName },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply rename column transformation');
    }

    return response.json();
  }

  static async changeColumnType(
    datasetId: string,
    columnName: string,
    dataType: string
  ): Promise<Transformation> {
    const response = await fetch(`${CleaningService.API_URL}/datasets/${datasetId}/transformations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        operation: 'change_type',
        parameters: { column_name: columnName, data_type: dataType },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to change column type');
    }

    return response.json();
  }

  static async filterRows(
    datasetId: string,
    columnName: string,
    operator: string,
    value: any
  ): Promise<Transformation> {
    const response = await fetch(`${CleaningService.API_URL}/datasets/${datasetId}/transformations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        operation: 'filter_rows',
        parameters: { column_name: columnName, operator, value },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to apply filter rows transformation');
    }

    return response.json();
  }

  static async removeColumns(datasetId: string, columns: string[]): Promise<Transformation> {
    const response = await fetch(`${CleaningService.API_URL}/datasets/${datasetId}/transformations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        operation: 'remove_columns',
        parameters: { columns },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove columns');
    }

    return response.json();
  }

  static async createCalculatedColumn(
    datasetId: string,
    columnName: string,
    expression: string
  ): Promise<Transformation> {
    const response = await fetch(`${CleaningService.API_URL}/datasets/${datasetId}/transformations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        operation: 'create_calculated_column',
        parameters: { column_name: columnName, expression },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create calculated column');
    }

    return response.json();
  }

  static async listTransformations(datasetId: string): Promise<Transformation[]> {
    const response = await fetch(
      `${CleaningService.API_URL}/datasets/${datasetId}/transformations`,
      {
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list transformations');
    }

    return response.json();
  }

  static async undoTransformation(datasetId: string, transformationId: string): Promise<void> {
    const response = await fetch(
      `${CleaningService.API_URL}/datasets/${datasetId}/transformations/${transformationId}`,
      {
        method: 'DELETE',
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to undo transformation');
    }
  }

  static async validatePipeline(datasetId: string): Promise<{ valid: boolean; errors: string[] }> {
    const response = await fetch(
      `${CleaningService.API_URL}/datasets/${datasetId}/validate-pipeline`,
      {
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to validate pipeline');
    }

    return response.json();
  }
}
