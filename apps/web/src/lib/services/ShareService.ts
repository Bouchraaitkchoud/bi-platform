import { AuthService } from '../auth';

export interface Share {
  id: string;
  dashboard_id: string;
  owner_id: string;
  shared_with_user_id?: string;
  shared_with_email?: string;
  permissions: {
    can_view: boolean;
    can_comment: boolean;
    can_edit: boolean;
  };
  message?: string;
  expires_at?: string;
  created_at: string;
}

export interface SharedDashboard {
  id: string;
  name: string;
  description?: string;
  owner_email: string;
  permissions: {
    can_view: boolean;
    can_comment: boolean;
    can_edit: boolean;
  };
  message?: string;
  shared_at: string;
  chart_count: number;
}

export class ShareService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  static async shareDashboard(
    dashboardId: string,
    email: string,
    permissions: {
      can_view?: boolean;
      can_comment?: boolean;
      can_edit?: boolean;
    },
    message?: string
  ): Promise<any> {
    const response = await fetch(`${ShareService.API_URL}/shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        dashboard_id: dashboardId,
        shared_with_email: email,
        permissions: {
          can_view: permissions.can_view ?? true,
          can_comment: permissions.can_comment ?? false,
          can_edit: permissions.can_edit ?? false,
        },
        message: message || null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to share dashboard');
    }

    return response.json();
  }

  static async listSharedDashboards(): Promise<SharedDashboard[]> {
    const response = await fetch(`${ShareService.API_URL}/shares?shared_with_me=true`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shared dashboards');
    }

    return response.json();
  }

  static async listDashboardShares(dashboardId: string): Promise<any[]> {
    const response = await fetch(`${ShareService.API_URL}/shares?dashboard_id=${dashboardId}`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard shares');
    }

    return response.json();
  }

  static async revokeShare(shareId: string): Promise<void> {
    const response = await fetch(`${ShareService.API_URL}/shares/${shareId}`, {
      method: 'DELETE',
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke share');
    }
  }
}
