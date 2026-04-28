'use client';

import React, { useMemo } from 'react';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';

interface ChartPreviewProps {
  config?: any;
  chartType?: string;
  height?: number;
}

export function ChartPreview({ config, chartType = 'bar', height = 180 }: ChartPreviewProps) {
  // Extract data stats from chart config
  const chartStats = useMemo(() => {
    if (!config) return { dataPoints: 0, hasData: false };
    
    let dataPoints = 0;
    
    // Try different config formats
    if (config.series && Array.isArray(config.series)) {
      // ECharts format
      const data = config.series[0]?.data || [];
      dataPoints = Array.isArray(data) ? data.length : 0;
    } else if (config.data && Array.isArray(config.data)) {
      dataPoints = config.data.length;
    } else if (config.xAxis?.data && Array.isArray(config.xAxis.data)) {
      dataPoints = config.xAxis.data.length;
    }
    
    return { dataPoints, hasData: dataPoints > 0 };
  }, [config]);

  const getChartIcon = () => {
    switch (chartType) {
      case 'line':
        return <LineChartIcon size={48} style={{ color: '#9ca3af' }} />;
      case 'pie':
        return <PieChartIcon size={48} style={{ color: '#9ca3af' }} />;
      case 'area':
        return <LineChartIcon size={48} style={{ color: '#9ca3af' }} />;
      default:
        return <BarChart3 size={48} style={{ color: '#9ca3af' }} />;
    }
  };

  const getChartTypeLabel = () => {
    return chartType.charAt(0).toUpperCase() + chartType.slice(1);
  };

  return (
    <div
      style={{
        width: '100%',
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      {getChartIcon()}
      <p style={{
        marginTop: '12px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#6b7280',
        margin: '12px 0 4px 0',
      }}>
        {getChartTypeLabel()} Chart
      </p>
      {chartStats.hasData && (
        <p style={{
          fontSize: '12px',
          color: '#9ca3af',
          margin: 0,
        }}>
          {chartStats.dataPoints} data point{chartStats.dataPoints !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
