import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDashboardStore } from '@/stores/dashboardStore';
import { Dashboard } from '@/stores/dashboardStore';
import getAuthClient from '@/lib/apiClient';

// List dashboards
export const useDashboards = () => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['dashboards'],
    queryFn: async () => {
      const response = await client.get<Dashboard[]>('/dashboards');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get single dashboard
export const useDashboard = (dashboardId: string) => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: async () => {
      const response = await client.get<Dashboard>(`/dashboards/${dashboardId}`);
      return response.data;
    },
    enabled: !!dashboardId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create dashboard
export const useCreateDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const client = getAuthClient();
      const response = await client.post<Dashboard>('/dashboards', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
};

// Update dashboard
export const useUpdateDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dashboard: Dashboard) => {
      const client = getAuthClient();
      const response = await client.put<Dashboard>(
        `/dashboards/${dashboard.id}`,
        dashboard
      );
      return response.data;
    },
    onSuccess: (dashboard) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', dashboard.id],
      });
    },
  });
};

// Add chart to dashboard
export const useAddChartToDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      dashboardId: string;
      chartId: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }) => {
      const client = getAuthClient();
      const response = await client.post(
        `/dashboards/${data.dashboardId}/charts`,
        {
          chart_id: data.chartId,
          x: data.x,
          y: data.y,
          w: data.w,
          h: data.h,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard', variables.dashboardId],
      });
    },
  });
};

// Update chart position in dashboard
export const useUpdateChartPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      dashboardId: string;
      chartId: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }) => {
      const client = getAuthClient();
      const response = await client.put(
        `/dashboards/${data.dashboardId}/charts/${data.chartId}`,
        {
          x: data.x,
          y: data.y,
          w: data.w,
          h: data.h,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard', variables.dashboardId],
      });
    },
  });
};

// Remove chart from dashboard
export const useRemoveChartFromDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      dashboardId: string;
      chartId: string;
    }) => {
      const client = getAuthClient();
      await client.delete(
        `/dashboards/${data.dashboardId}/charts/${data.chartId}`
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard', variables.dashboardId],
      });
    },
  });
};

// Delete dashboard
export const useDeleteDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dashboardId: string) => {
      const client = getAuthClient();
      await client.delete(`/dashboards/${dashboardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
};
