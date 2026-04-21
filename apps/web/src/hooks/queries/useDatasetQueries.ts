import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDatasetStore } from '@/stores/datasetStore';
import { Dataset } from '@/stores/datasetStore';
import getAuthClient from '@/lib/apiClient';

// List datasets
export const useDatasets = (userId?: string) => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['datasets', userId],
    queryFn: async () => {
      const response = await client.get<Dataset[]>('/datasets');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get single dataset
export const useDataset = (datasetId: string) => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: async () => {
      const response = await client.get<Dataset>(`/datasets/${datasetId}`);
      return response.data;
    },
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000,
  });
};

// Upload dataset
export const useUploadDataset = () => {
  const queryClient = useQueryClient();
  const addDataset = useDatasetStore((state) => state.addDataset);
  const setError = useDatasetStore((state) => state.setError);

  return useMutation({
    mutationFn: async (file: File) => {
      const client = getAuthClient();
      const formData = new FormData();
      formData.append('file', file);

      // Let axios set Content-Type + boundary automatically for FormData
      const response = await client.post<Dataset>('/datasets/upload/file', formData);
      return response.data;
    },
    onSuccess: (dataset) => {
      addDataset(dataset);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      setError(null);
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Upload failed';
      setError(message);
    },
  });
};

// Delete dataset
export const useDeleteDataset = () => {
  const queryClient = useQueryClient();
  const removeDataset = useDatasetStore((state) => state.removeDataset);

  return useMutation({
    mutationFn: async (datasetId: string) => {
      const client = getAuthClient();
      await client.delete(`/datasets/${datasetId}`);
    },
    onSuccess: (_, datasetId) => {
      removeDataset(datasetId);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
};

// Update dataset
export const useUpdateDataset = () => {
  const queryClient = useQueryClient();
  const updateDataset = useDatasetStore((state) => state.updateDataset);

  return useMutation({
    mutationFn: async (dataset: Dataset) => {
      const client = getAuthClient();
      const response = await client.put<Dataset>(
        `/datasets/${dataset.id}`,
        dataset
      );
      return response.data;
    },
    onSuccess: (dataset) => {
      updateDataset(dataset);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset', dataset.id] });
    },
  });
};

// Get dataset statistics
export const useDatasetStats = (datasetId: string) => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['datasetStats', datasetId],
    queryFn: async () => {
      const response = await client.get(`/datasets/${datasetId}/stats`);
      return response.data;
    },
    enabled: !!datasetId,
  });
};

// Get dataset preview
export const useDatasetPreview = (datasetId: string, limit: number = 10) => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['datasetPreview', datasetId, limit],
    queryFn: async () => {
      const response = await client.get(
        `/datasets/${datasetId}/preview?limit=${limit}`
      );
      return response.data;
    },
    enabled: !!datasetId,
  });
};
