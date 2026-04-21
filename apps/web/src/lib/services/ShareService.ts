import { AuthService } from '../auth';

export interface Share {
  id: string;
  dashboard_id: string;
  owner_id: string;
  shared_with_user_id?: string;
  shared_with_email?: string;
  can_view: boolean;
  can_comment: boolean;
  can_edit: boolean;
  expires_at?: string;
  created_at: string;
}

export interface SharedDashboard {
  id: string;
  name: string;
  description?: string;
  owner_email: string;
  shared_by: string;
  can_view: boolean;
  can_edit: boolean;
  shared_at: string;
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
    }
  ): Promise<Share> {
    const response = await fetch(`${ShareService.API_URL}/shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        dashboard_id: dashboardId,
        shared_with_email: email,
        ...permissions,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to share dashboard');
    }

    return response.json();
  }

  static async listSharedDashboards(): Promise<SharedDashboard[]> {
    const response = await fetch(`${ShareService.API_URL}/shares`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch shared dashboards');
    }

    return response.json();
  }

  static async updateShare(
    shareId: string,
    permissions: {
      can_view?: boolean;
      can_comment?: boolean;
      can_edit?: boolean;
    }
  ): Promise<Share> {
    const response = await fetch(`${ShareService.API_URL}/shares/${shareId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify(permissions),
    });

    if (!response.ok) {
      throw new Error('Failed to update share permissions');
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

  static async listDashboardShares(dashboardId: string): Promise<Share[]> {
    const response = await fetch(`${ShareService.API_URL}/dashboards/${dashboardId}/shares`, {
      headers: AuthService.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard shares');
    }

    return response.json();
  }
}
