import { AuthService } from '../auth';

export interface Dashboard {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  layout_config: Record<string, any>;
  chart_ids: string[];
  created_at: string;
  updated_at: string;
}

export class DashboardService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  static async createDashboard(
    name: string,
    description: string,
    layout_config: Record<string, any> = {},
    chart_ids: string[] = []
  ): Promise<Dashboard> {
    const response = await fetch(`${DashboardService.API_URL}/dashboards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        name,
        description,
        layout_config,
        chart_ids,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create dashboard');
    }

    return response.json();
  }

  static async listDashboards(skip = 0, limit = 10): Promise<Dashboard[]> {
    const response = await fetch(
      `${DashboardService.API_URL}/dashboards?skip=${skip}&limit=${limit}`,
      {
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch dashboards');
    }

    return response.json();
  }

  static async getDashboard(dashboardId: string): Promise<Dashboard> {
    const response = await fetch(`${DashboardService.API_URL}/dashboards/${dashboardId}`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard');
    }

    return response.json();
  }

  static async updateDashboard(
    dashboardId: string,
    name: string,
    description: string,
    layout_config: Record<string, any>,
    chart_ids: string[]
  ): Promise<Dashboard> {
    const response = await fetch(`${DashboardService.API_URL}/dashboards/${dashboardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        name,
        description,
        layout_config,
        chart_ids,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update dashboard');
    }

    return response.json();
  }

  static async updateLayout(dashboardId: string, layout_config: Record<string, any>): Promise<Dashboard> {
    const response = await fetch(`${DashboardService.API_URL}/dashboards/${dashboardId}/layout`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify(layout_config),
    });

    if (!response.ok) {
      throw new Error('Failed to update dashboard layout');
    }

    return response.json();
  }

  static async addChartToDashboard(dashboardId: string, chartId: string): Promise<Dashboard> {
    const response = await fetch(`${DashboardService.API_URL}/dashboards/${dashboardId}/charts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({ chart_id: chartId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add chart to dashboard');
    }

    return response.json();
  }

  static async removeChartFromDashboard(dashboardId: string, chartId: string): Promise<Dashboard> {
    const response = await fetch(
      `${DashboardService.API_URL}/dashboards/${dashboardId}/charts/${chartId}`,
      {
        method: 'DELETE',
        headers: AuthService.getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to remove chart from dashboard');
    }

    return response.json();
  }

  static async deleteDashboard(dashboardId: string): Promise<void> {
    const response = await fetch(`${DashboardService.API_URL}/dashboards/${dashboardId}`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete dashboard');
    }
  }
}
