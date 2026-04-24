'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, Edit2, Save, X, Plus, Loader2, AlertCircle } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ReactECharts from 'echarts-for-react';
import { ChartService, Chart } from '@/lib/services/ChartService';

let GridLayoutComponent: any = null;

// Client-side only import
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const RGL = require('react-grid-layout');
  GridLayoutComponent = RGL.Responsive;
}

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const dashboardId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [charts, setCharts] = useState<Chart[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<any>({
    lg: []
  });

  // Load charts on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const loadCharts = async () => {
      try {
        setIsLoading(true);
        // Fetch all charts (no filter, get all user's charts)
        const allCharts = await ChartService.listCharts(0, 100);
        setCharts(allCharts);
        
        // Generate default layouts for charts
        const defaultLayouts: LayoutItem[] = allCharts.map((chart, index) => ({
          i: chart.id,
          x: (index % 2) * 6,
          y: Math.floor(index / 2) * 6,
          w: 6,
          h: 6,
        }));
        
        setLayouts({ lg: defaultLayouts });
        setError(null);
      } catch (err) {
        console.error('Failed to load charts:', err);
        setError('Failed to load charts. Please try again.');
        setCharts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharts();
  }, [isMounted]);


  const onLayoutChange = (layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
  };

  const renderChartWidget = (chart: Chart) => {
    if (!chart.config) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-4 h-full justify-center items-center">
          <AlertCircle size={32} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No chart data available</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700">{chart.name}</h3>
          {chart.description && <p className="text-xs text-gray-500 mt-1">{chart.description}</p>}
        </div>
        <div className="flex-1 p-2 overflow-hidden">
          <ReactECharts 
            option={chart.config} 
            style={{ height: '100%', width: '100%' }}
            notMerge
            lazyUpdate
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans">
      {/* Dashboard Top Ribbon */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          {editMode ? (
            <input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="text-2xl font-bold bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-800"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{dashboardName}</h1>
          )}
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium flex items-center gap-2 transition-colors">
                <X size={16} /> Cancel
              </button>
              <button onClick={() => setEditMode(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center gap-2 shadow-sm transition-colors">
                <Save size={16} /> Save Layout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => router.push('/charts')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center gap-2 shadow-sm transition-colors"
              >
                👁️ See Created Charts
              </button>
              <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md font-medium flex items-center gap-2 shadow-sm transition-colors">
                <Edit2 size={16} /> Edit Dashboard
              </button>
              <button className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md font-medium flex items-center gap-2 shadow-sm transition-colors">
                <Share2 size={16} /> Share
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 p-6 overflow-auto flex flex-col">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-blue-600 mb-2 mx-auto" />
              <p className="text-gray-600">Loading your charts...</p>
            </div>
          </div>
        ) : charts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Plus size={32} className="text-gray-300 mb-2 mx-auto" />
              <p className="text-gray-600 mb-4">No charts yet. Create your first chart to get started!</p>
              <button 
                onClick={() => router.push('/charts/new')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center gap-2 mx-auto"
              >
                <Plus size={16} /> Create Chart
              </button>
            </div>
          </div>
        ) : (
          isMounted && GridLayoutComponent ? (
          <div className="w-full h-full overflow-auto">
            <div style={{ minWidth: 'min-content', width: 'fit-content' }}>
              <GridLayoutComponent
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={60}
                onLayoutChange={onLayoutChange}
                isDraggable={editMode}
                isResizable={editMode}
                margin={[16, 16]}
                compactType="vertical"
              >
                {charts.map((chart) => (
                  <div key={chart.id} className="min-h-0">
                    {renderChartWidget(chart)}
                  </div>
                ))}
              </GridLayoutComponent>
            </div>
          </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-500">Loading dashboard layout...</p>
            </div>
          )
        )}
      </div>

    </div>
  );
}
