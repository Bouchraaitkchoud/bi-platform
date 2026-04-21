import { create } from 'zustand';

export interface DashboardChart {
  chartId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Dashboard {
  id: string;
  name: string;
  user_id: string;
  layout_config: DashboardChart[];
  chart_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface DashboardState {
  dashboards: Dashboard[];
  activeDashboard: Dashboard | null;
  layout: DashboardChart[];
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDashboards: (dashboards: Dashboard[]) => void;
  setActiveDashboard: (dashboard: Dashboard | null) => void;
  setLayout: (layout: DashboardChart[]) => void;
  setFilters: (filters: Record<string, unknown>) => void;
  addChart: (chart: DashboardChart) => void;
  removeChart: (chartId: string) => void;
  updateChartPosition: (
    chartId: string,
    x: number,
    y: number,
    w: number,
    h: number
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dashboards: [],
  activeDashboard: null,
  layout: [],
  filters: {},
  isLoading: false,
  error: null,

  setDashboards: (dashboards) =>
    set({ dashboards }),

  setActiveDashboard: (dashboard) =>
    set({ activeDashboard: dashboard }),

  setLayout: (layout) =>
    set({ layout }),

  setFilters: (filters) =>
    set({ filters }),

  addChart: (chart) =>
    set((state) => ({
      layout: [...state.layout, chart],
    })),

  removeChart: (chartId) =>
    set((state) => ({
      layout: state.layout.filter((c) => c.chartId !== chartId),
    })),

  updateChartPosition: (chartId, x, y, w, h) =>
    set((state) => ({
      layout: state.layout.map((c) =>
        c.chartId === chartId
          ? { ...c, x, y, w, h }
          : c
      ),
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error }),

  clearError: () =>
    set({ error: null }),

  reset: () =>
    set({
      dashboards: [],
      activeDashboard: null,
      layout: [],
      filters: {},
      isLoading: false,
      error: null,
    }),
}));
