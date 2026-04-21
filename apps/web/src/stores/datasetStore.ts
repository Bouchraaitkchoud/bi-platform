import { create } from 'zustand';

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  file_type: string;
  row_count: number;
  column_count: number;
  columns_metadata: Column[];
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
  created_at: string;
  updated_at: string;
}

export interface DatasetState {
  activeDataset: Dataset | null;
  datasets: Dataset[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveDataset: (dataset: Dataset) => void;
  setDatasets: (datasets: Dataset[]) => void;
  addDataset: (dataset: Dataset) => void;
  updateDataset: (dataset: Dataset) => void;
  removeDataset: (datasetId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  activeDataset: null,
  datasets: [],
  isLoading: false,
  error: null,

  setActiveDataset: (dataset) =>
    set({ activeDataset: dataset }),

  setDatasets: (datasets) =>
    set({ datasets }),

  addDataset: (dataset) =>
    set((state) => ({
      datasets: [dataset, ...state.datasets],
    })),

  updateDataset: (dataset) =>
    set((state) => ({
      datasets: state.datasets.map((d) =>
        d.id === dataset.id ? dataset : d
      ),
      activeDataset:
        state.activeDataset?.id === dataset.id
          ? dataset
          : state.activeDataset,
    })),

  removeDataset: (datasetId) =>
    set((state) => ({
      datasets: state.datasets.filter((d) => d.id !== datasetId),
      activeDataset:
        state.activeDataset?.id === datasetId
          ? null
          : state.activeDataset,
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error }),

  clearError: () =>
    set({ error: null }),

  reset: () =>
    set({
      activeDataset: null,
      datasets: [],
      isLoading: false,
      error: null,
    }),
}));
