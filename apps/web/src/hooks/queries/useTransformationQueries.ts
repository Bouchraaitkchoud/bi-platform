import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import getAuthClient from '@/lib/apiClient';

export interface Transformation {
  id: string;
  dataset_id: string;
  step_order: number;
  operation: string;
  parameters: Record<string, unknown>;
  description?: string;
  created_at: string;
}

// Get transformation history
export const useTransformations = (datasetId: string) => {
  const client = getAuthClient();

  return useQuery({
    queryKey: ['transformations', datasetId],
    queryFn: async () => {
      const response = await client.get<Transformation[]>(
        `/datasets/${datasetId}/transformations`
      );
      return response.data;
    },
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000,
  });
};

// Apply transformation
export const useApplyTransformation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      datasetId: string;
      operation: string;
      parameters: Record<string, unknown>;
      description?: string;
    }) => {
      const client = getAuthClient();
      const response = await client.post(
        `/datasets/${data.datasetId}/transformations`,
        {
          operation: data.operation,
          parameters: data.parameters,
          description: data.description,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['transformations', variables.datasetId],
      });
      queryClient.invalidateQueries({
        queryKey: ['dataset', variables.datasetId],
      });
    },
  });
};

// Undo transformation
export const useUndoTransformation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (datasetId: string) => {
      const client = getAuthClient();
      await client.post(`/datasets/${datasetId}/transformations/undo`);
    },
    onSuccess: (_, datasetId) => {
      queryClient.invalidateQueries({
        queryKey: ['transformations', datasetId],
      });
      queryClient.invalidateQueries({ queryKey: ['dataset', datasetId] });
    },
  });
};

// Redo transformation
export const useRedoTransformation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (datasetId: string) => {
      const client = getAuthClient();
      await client.post(`/datasets/${datasetId}/transformations/redo`);
    },
    onSuccess: (_, datasetId) => {
      queryClient.invalidateQueries({
        queryKey: ['transformations', datasetId],
      });
      queryClient.invalidateQueries({ queryKey: ['dataset', datasetId] });
    },
  });
};
