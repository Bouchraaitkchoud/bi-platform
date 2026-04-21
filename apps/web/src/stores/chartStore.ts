import { create } from 'zustand';

export interface ChartConfig {
  id: string;
  name: string;
  type: string;
  datasetId: string;
  x_column?: string;
  y_columns?: string[];
  aggregation?: string;
  filters?: Record<string, unknown>;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChartState {
  charts: ChartConfig[];
  activeChart: ChartConfig | null;
  editingChart: Partial<ChartConfig> | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCharts: (charts: ChartConfig[]) => void;
  setActiveChart: (chart: ChartConfig | null) => void;
  setEditingChart: (chart: Partial<ChartConfig> | null) => void;
  addChart: (chart: ChartConfig) => void;
  updateChart: (chart: ChartConfig) => void;
  removeChart: (chartId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  charts: [],
  activeChart: null,
  editingChart: null,
  isLoading: false,
  error: null,

  setCharts: (charts) =>
    set({ charts }),

  setActiveChart: (chart) =>
    set({ activeChart: chart }),

  setEditingChart: (chart) =>
    set({ editingChart: chart }),

  addChart: (chart) =>
    set((state) => ({
      charts: [chart, ...state.charts],
    })),

  updateChart: (chart) =>
    set((state) => ({
      charts: state.charts.map((c) =>
        c.id === chart.id ? chart : c
      ),
      activeChart:
        state.activeChart?.id === chart.id
          ? chart
          : state.activeChart,
    })),

  removeChart: (chartId) =>
    set((state) => ({
      charts: state.charts.filter((c) => c.id !== chartId),
      activeChart:
        state.activeChart?.id === chartId
          ? null
          : state.activeChart,
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error }),

  clearError: () =>
    set({ error: null }),

  reset: () =>
    set({
      charts: [],
      activeChart: null,
      editingChart: null,
      isLoading: false,
      error: null,
    }),
}));
