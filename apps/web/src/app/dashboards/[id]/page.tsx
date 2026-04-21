'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Share2, Edit2, Save, X, Plus, Loader2 } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Responsive, WidthProvider } = require('react-grid-layout');
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ReactECharts from 'echarts-for-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

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

  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dashboardName, setDashboardName] = useState('Sales Overview Dashboard');
  const [layouts, setLayouts] = useState<any>({
    lg: [
      { i: '1', x: 0, y: 0, w: 12, h: 4 },
      { i: '2', x: 0, y: 4, w: 6, h: 6 },
      { i: '3', x: 6, y: 4, w: 6, h: 6 },
      { i: '4', x: 0, y: 10, w: 12, h: 4 },
    ]
  });

  const getBarChartOption = () => ({
    tooltip: {},
    xAxis: { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
    yAxis: {},
    series: [{
      name: 'Sales',
      type: 'bar',
      data: [150, 230, 224, 218, 135, 147],
      itemStyle: { color: '#3b82f6' }
    }]
  });

  const getLineChartOption = () => ({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    yAxis: { type: 'value' },
    series: [{
      data: [820, 932, 901, 934],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#10b981' }
    }]
  });

  const getPieChartOption = () => ({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 1048, name: 'Search Engine', itemStyle: { color: '#3b82f6' } },
          { value: 735, name: 'Direct', itemStyle: { color: '#10b981' } },
          { value: 580, name: 'Email', itemStyle: { color: '#f59e0b' } },
          { value: 484, name: 'Union Ads', itemStyle: { color: '#8b5cf6' } },
        ]
      }
    ]
  });

  const onLayoutChange = (layout: any, allLayouts: any) => {
    setLayouts(allLayouts);
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
      <div className="flex-1 p-6 overflow-hidden">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          onLayoutChange={onLayoutChange}
          isDraggable={editMode}
          isResizable={editMode}
          margin={[16, 16]}
        >
          <div key="1" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Key Metrics</h3>
            <div className="flex gap-8 items-center h-full">
               <div className="flex flex-col">
                 <span className="text-sm font-medium text-gray-500 uppercase">Total Sales</span>
                 <span className="text-3xl font-bold text-gray-900">$1,204,500</span>
                 <span className="text-xs text-green-500 font-medium">+14.5% vs last month</span>
               </div>
               <div className="w-px h-16 bg-gray-200"></div>
               <div className="flex flex-col">
                 <span className="text-sm font-medium text-gray-500 uppercase">Active Users</span>
                 <span className="text-3xl font-bold text-gray-900">45.2K</span>
                 <span className="text-xs text-green-500 font-medium">+2.1% vs last month</span>
               </div>
            </div>
          </div>
          
          <div key="2" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Monthly Revenue</h3>
            </div>
            <div className="flex-1 p-2">
              <ReactECharts option={getBarChartOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          <div key="3" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Traffic Sources</h3>
            </div>
            <div className="flex-1 p-2">
              <ReactECharts option={getPieChartOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          <div key="4" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Quarterly Growth</h3>
            </div>
            <div className="flex-1 p-2">
              <ReactECharts option={getLineChartOption()} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </ResponsiveGridLayout>
      </div>

    </div>
  );
}
