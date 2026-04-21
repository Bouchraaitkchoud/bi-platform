import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useChartStore } from '@/stores/chartStore';
import { ChartConfig } from '@/stores/chartStore';
import getAuthClient from '@/lib/apiClient';

// List charts
export const useCharts = (datasetId?: string) => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['charts', datasetId],
    queryFn: async () => {
      const url = datasetId ? `/charts?dataset_id=${datasetId}` : '/charts';
      const response = await client.get<ChartConfig[]>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get single chart
export const useChart = (chartId: string) => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['chart', chartId],
    queryFn: async () => {
      const response = await client.get<ChartConfig>(`/charts/${chartId}`);
      return response.data;
    },
    enabled: !!chartId,
    staleTime: 5 * 60 * 1000,
  });
};

// Create chart
export const useCreateChart = () => {
  const queryClient = useQueryClient();
  const addChart = useChartStore((state) => state.addChart);

  return useMutation({
    mutationFn: async (chartData: Partial<ChartConfig>) => {
      const client = getAuthClient();
      const response = await client.post<ChartConfig>('/charts', chartData);
      return response.data;
    },
    onSuccess: (chart) => {
      addChart(chart);
      queryClient.invalidateQueries({ queryKey: ['charts'] });
    },
  });
};

// Update chart
export const useUpdateChart = () => {
  const queryClient = useQueryClient();
  const updateChart = useChartStore((state) => state.updateChart);

  return useMutation({
    mutationFn: async (chart: ChartConfig) => {
      const client = getAuthClient();
      const response = await client.put<ChartConfig>(
        `/charts/${chart.id}`,
        chart
      );
      return response.data;
    },
    onSuccess: (chart) => {
      updateChart(chart);
      queryClient.invalidateQueries({ queryKey: ['charts'] });
      queryClient.invalidateQueries({ queryKey: ['chart', chart.id] });
    },
  });
};

// Delete chart
export const useDeleteChart = () => {
  const queryClient = useQueryClient();
  const removeChart = useChartStore((state) => state.removeChart);

  return useMutation({
    mutationFn: async (chartId: string) => {
      const client = getAuthClient();
      await client.delete(`/charts/${chartId}`);
    },
    onSuccess: (_, chartId) => {
      removeChart(chartId);
      queryClient.invalidateQueries({ queryKey: ['charts'] });
    },
  });
};

// Export chart
export const useExportChart = (chartId: string, format: 'json' | 'csv' = 'json') => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['exportChart', chartId, format],
    queryFn: async () => {
      const response = await client.get(
        `/charts/${chartId}/export?format=${format}`,
        { responseType: 'blob' }
      );
      return response.data;
    },
    enabled: false, // Manual invocation
  });
};
