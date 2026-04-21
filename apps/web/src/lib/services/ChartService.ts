import { AuthService } from '../auth';

export interface Chart {
  id: string;
  dataset_id: string;
  user_id: string;
  name: string;
  description?: string;
  chart_type: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChartData {
  labels: string[];
  datasets: any[];
}

export class ChartService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  static async createChart(
    name: string,
    description: string,
    dataset_id: string,
    chart_type: string,
    config: Record<string, any>
  ): Promise<Chart> {
    const response = await fetch(`${ChartService.API_URL}/charts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        name,
        description,
        dataset_id,
        chart_type,
        config,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create chart');
    }

    return response.json();
  }

  static async listCharts(skip = 0, limit = 10, dataset_id?: string): Promise<Chart[]> {
    const url = new URL(`${ChartService.API_URL}/charts`);
    url.searchParams.append('skip', skip.toString());
    url.searchParams.append('limit', limit.toString());
    if (dataset_id) {
      url.searchParams.append('dataset_id', dataset_id);
    }

    const response = await fetch(url.toString(), {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch charts');
    }

    return response.json();
  }

  static async getChart(chartId: string): Promise<Chart> {
    const response = await fetch(`${ChartService.API_URL}/charts/${chartId}`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chart');
    }

    return response.json();
  }

  static async getChartData(chartId: string, filters?: Record<string, any>): Promise<ChartData> {
    const response = await fetch(`${ChartService.API_URL}/charts/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        chart_id: chartId,
        filters: filters || {},
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chart data');
    }

    return response.json();
  }

  static async updateChart(chartId: string, config: Record<string, any>): Promise<Chart> {
    const response = await fetch(`${ChartService.API_URL}/charts/${chartId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Failed to update chart');
    }

    return response.json();
  }

  static async deleteChart(chartId: string): Promise<void> {
    const response = await fetch(`${ChartService.API_URL}/charts/${chartId}`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete chart');
    }
  }

  static async exportChartPNG(chartId: string): Promise<Blob> {
    const response = await fetch(`${ChartService.API_URL}/charts/${chartId}/export/png`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to export chart');
    }

    return response.blob();
  }

  static getChartTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      LINE: '📈 Line Chart',
      BAR: '📊 Bar Chart',
      AREA: '📉 Area Chart',
      SCATTER: '🔵 Scatter Plot',
      PIE: '🥧 Pie Chart',
      DONUT: '🍩 Donut Chart',
      HISTOGRAM: '📏 Histogram',
      BOX: '📦 Box Plot',
      KPI_CARD: '🎯 KPI Card',
      GAUGE: '🎛️ Gauge',
      COMBO: '🔀 Combo Chart',
      TREEMAP: '🗺️ Treemap',
      WATERFALL: '💧 Waterfall',
      FUNNEL: '🔻 Funnel',
      BUBBLE: '🫧 Bubble Chart',
      HEATMAP: '🔥 Heatmap',
      TABLE: '📋 Table',
      MATRIX: '⊞ Matrix',
    };
    return labels[type] || type;
  }

  static CHART_TYPES = [
    'LINE',
    'BAR',
    'AREA',
    'SCATTER',
    'PIE',
    'DONUT',
    'HISTOGRAM',
    'BOX',
    'KPI_CARD',
    'GAUGE',
    'COMBO',
    'TREEMAP',
    'WATERFALL',
    'FUNNEL',
    'BUBBLE',
    'HEATMAP',
    'TABLE',
    'MATRIX',
  ];

  static AGGREGATIONS = ['sum', 'avg', 'count', 'min', 'max'];
}
