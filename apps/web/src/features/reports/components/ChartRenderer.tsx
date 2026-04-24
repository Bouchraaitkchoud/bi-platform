'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  Bar,
  Line,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
} from 'recharts';

interface ChartData {
  [key: string]: any;
}

interface ChartRendererProps {
  data: ChartData[];
  chartType: 'bar' | 'line' | 'pie' | 'area';
  dimensionColumn: string;
  measureColumn: string;
  title?: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

export function ChartRenderer({
  data,
  chartType,
  dimensionColumn,
  measureColumn,
  title,
}: ChartRendererProps) {
  // Transform data for the chart with aggregation
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by dimension and aggregate measure values
    const grouped: { [key: string]: number[] } = {};
    
    data.forEach((row) => {
      const dimensionValue = String(row[dimensionColumn] || 'N/A');
      const measureValue = parseFloat(row[measureColumn]) || 0;
      
      if (!grouped[dimensionValue]) {
        grouped[dimensionValue] = [];
      }
      grouped[dimensionValue].push(measureValue);
    });

    // Aggregate: calculate average for each dimension group
    return Object.entries(grouped).map(([name, values]) => ({
      name,
      value: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
    }));
  }, [data, dimensionColumn, measureColumn]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 font-medium">No data available</p>
          <p className="text-xs text-gray-400 mt-1">Select valid dimension and measure columns</p>
        </div>
      </div>
    );
  }

  // Custom tooltip for all chart types
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-blue-600">
            {measureColumn}: {typeof data.value === 'number' ? data.value.toFixed(2) : data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded border border-gray-200 p-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' && (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="#3b82f6" 
                name={measureColumn}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}

          {chartType === 'line' && (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value"
                stroke="#3b82f6"
                name={measureColumn}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            </LineChart>
          )}

          {chartType === 'pie' && (
            <RechartsPieChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          )}

          {chartType === 'area' && (
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorValue)"
                name={measureColumn}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
