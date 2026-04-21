// API Client for BI Platform
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  detail?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  detail?: string;
}

class ApiClient {
  private baseURL = API_BASE_URL;

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async requestFormData<T>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: any = {
      ...options.headers,
    };

    const token = useAuthStore.getState().accessToken;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      ...options,
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.requestFormData<T>(endpoint, formData);
  }
}

export const apiClient = new ApiClient();

// Auth Service
export const authApi = {
  register: (data: { full_name: string; email: string; password: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// Datasets Service
export const datasetsApi = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData('/datasets/upload/file', formData);
  },
  listDatasets: () => apiClient.get('/datasets'),
  getDataset: (id: string) => apiClient.get(`/datasets/${id}`),
  getDatasetPreview: (id: string, skip: number = 0, limit: number = 100) =>
    apiClient.get(`/datasets/${id}/preview?skip=${skip}&limit=${limit}`),
  getColumnStatistics: (id: string) =>
    apiClient.get(`/datasets/${id}/statistics`),
  getDataQuality: (id: string) =>
    apiClient.get(`/datasets/${id}/quality`),
  deleteDataset: (id: string) => apiClient.delete(`/datasets/${id}`),
  updateDataset: (id: string, data: any) =>
    apiClient.put(`/datasets/${id}`, data),
};

// Data Cleaning Service
export const cleaningApi = {
  applyOperation: (datasetId: string, operation: any) =>
    apiClient.post(`/datasets/${datasetId}/cleaning/apply`, operation),
  getTransformations: (datasetId: string) =>
    apiClient.get(`/datasets/${datasetId}/cleaning/transformations`),
  undoOperation: (datasetId: string) =>
    apiClient.post(`/datasets/${datasetId}/cleaning/undo`, {}),
  getCleaningPlan: (datasetId: string) =>
    apiClient.get(`/datasets/${datasetId}/cleaning/plan`),
};

// Data Modeling Service
export const modelingApi = {
  createMeasure: (datasetId: string, data: any) =>
    apiClient.post(`/datasets/${datasetId}/measures`, data),
  listMeasures: (datasetId: string) =>
    apiClient.get(`/datasets/${datasetId}/measures`),
  updateMeasure: (datasetId: string, measureId: string, data: any) =>
    apiClient.put(`/datasets/${datasetId}/measures/${measureId}`, data),
  deleteMeasure: (datasetId: string, measureId: string) =>
    apiClient.delete(`/datasets/${datasetId}/measures/${measureId}`),
  createCalculatedColumn: (datasetId: string, data: any) =>
    apiClient.post(`/datasets/${datasetId}/calculated-columns`, data),
  listCalculatedColumns: (datasetId: string) =>
    apiClient.get(`/datasets/${datasetId}/calculated-columns`),
  updateCalculatedColumn: (datasetId: string, colId: string, data: any) =>
    apiClient.put(`/datasets/${datasetId}/calculated-columns/${colId}`, data),
  deleteCalculatedColumn: (datasetId: string, colId: string) =>
    apiClient.delete(`/datasets/${datasetId}/calculated-columns/${colId}`),
};

// Charts Service
export const chartsApi = {
  createChart: (data: any) =>
    apiClient.post('/charts', data),
  listCharts: () => apiClient.get('/charts'),
  getChart: (id: string) => apiClient.get(`/charts/${id}`),
  getChartData: (id: string) =>
    apiClient.get(`/charts/${id}/data`),
  updateChart: (id: string, data: any) =>
    apiClient.put(`/charts/${id}`, data),
  deleteChart: (id: string) => apiClient.delete(`/charts/${id}`),
  getChartPreview: (id: string) =>
    apiClient.get(`/charts/${id}/preview`),
};

// Dashboards Service
export const dashboardsApi = {
  createDashboard: (data: any) =>
    apiClient.post('/dashboards', data),
  listDashboards: () => apiClient.get('/dashboards'),
  getDashboard: (id: string) => apiClient.get(`/dashboards/${id}`),
  updateDashboard: (id: string, data: any) =>
    apiClient.put(`/dashboards/${id}`, data),
  deleteDashboard: (id: string) =>
    apiClient.delete(`/dashboards/${id}`),
  addChartToDashboard: (dashboardId: string, chartId: string) =>
    apiClient.post(`/dashboards/${dashboardId}/charts/${chartId}`, {}),
  removeChartFromDashboard: (dashboardId: string, chartId: string) =>
    apiClient.delete(`/dashboards/${dashboardId}/charts/${chartId}`),
  updateLayout: (id: string, layout: any) =>
    apiClient.put(`/dashboards/${id}/layout`, layout),
};

// Sharing Service
export const sharingApi = {
  shareDashboard: (dashboardId: string, data: any) =>
    apiClient.post(`/dashboards/${dashboardId}/share`, data),
  getSharedDashboards: () => apiClient.get('/shares/dashboards'),
  updateSharePermissions: (shareId: string, data: any) =>
    apiClient.put(`/shares/${shareId}`, data),
  removeShare: (shareId: string) =>
    apiClient.delete(`/shares/${shareId}`),
};

// Filters Service
export const filtersApi = {
  applyFilter: (datasetId: string, filter: any) =>
    apiClient.post(`/datasets/${datasetId}/filters`, filter),
  getAppliedFilters: (datasetId: string) =>
    apiClient.get(`/datasets/${datasetId}/filters`),
  clearFilters: (datasetId: string) =>
    apiClient.delete(`/datasets/${datasetId}/filters`),
};
