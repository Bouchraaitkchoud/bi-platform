'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, LineChart, PieChart, AreaChart, Save, AlertCircle } from 'lucide-react';
import { DatasetService } from '@/lib/services/DatasetService';
import { WarehouseService } from '@/lib/services/WarehouseService';
import { ChartService } from '@/lib/services/ChartService';
import { ChartRenderer } from './ChartRenderer';

interface ReportBuilderFixedProps {
  datasetId?: string | null;
  warehouseId?: string | null;
  tableName?: string | null;
}

const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
  { id: 'line', name: 'Line Chart', icon: LineChart },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
  { id: 'area', name: 'Area Chart', icon: AreaChart },
];

export function ReportBuilderFixed({ datasetId, warehouseId, tableName }: ReportBuilderFixedProps) {
  const router = useRouter();

  const [columns, setColumns] = useState<string[]>([]);
  const [datasetData, setDatasetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartName, setChartName] = useState('Untitled Chart');
  const [chartDescription, setChartDescription] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedMeasure, setSelectedMeasure] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadColumns = async () => {
      if (!datasetId && (!warehouseId || !tableName)) {
        setError('No dataset or warehouse table selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let preview;

        if (warehouseId && tableName) {
          // Load warehouse table preview
          preview = await WarehouseService.getTablePreview(warehouseId, tableName, 1000);
        } else if (datasetId) {
          // Load dataset preview
          preview = await DatasetService.getDatasetPreview(datasetId, 1000);
        }

        if (preview && preview.data && preview.data.length > 0) {
          const cols = Object.keys(preview.data[0]);
          setColumns(cols);
          setDatasetData(preview.data);
          // Auto-select first two columns
          if (cols.length > 0) setSelectedDimension(cols[0]);
          if (cols.length > 1) setSelectedMeasure(cols[1]);
        } else {
          setError('Unable to load data columns');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadColumns();
  }, [datasetId, warehouseId, tableName]);

  const handleSaveChart = async () => {
    if (!selectedDimension || !selectedMeasure) {
      setError('Please select both a dimension and a measure');
      return;
    }

    if (!chartName.trim()) {
      setError('Chart name is required');
      return;
    }

    setSaving(true);
    try {
      // Prepare the chart config (echarts format)
      const chartConfig = {
        tooltip: { trigger: 'axis' },
        xAxis: { 
          type: 'category', 
          data: datasetData.length > 0 
            ? datasetData.map(d => String(d[selectedDimension])).slice(0, 50)
            : []
        },
        yAxis: { type: 'value' },
        series: [{
          name: selectedMeasure,
          data: datasetData.length > 0 
            ? datasetData.map(d => {
                const val = d[selectedMeasure];
                return typeof val === 'number' ? val : parseFloat(val) || 0;
              }).slice(0, 50)
            : [],
          type: chartType,
          smooth: chartType === 'line',
        }],
      };

      // Create the chart
      const chart = await ChartService.createChart(
        chartName,
        chartDescription,
        datasetId || '',
        chartType.toUpperCase(),
        chartConfig
      );

      setError(null);
      // Redirect to charts page to see the newly created chart
      setTimeout(() => router.push('/charts'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save chart');
      console.error('Error saving chart:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-2">Loading...</div>
          <p className="text-gray-600">Fetching dataset columns...</p>
        </div>
      </div>
    );
  }

  if (error || columns.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Dataset</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500 mb-4">Please ensure the dataset has data and try again. You can also go back and select a different dataset.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push('/datasets')}>
              Go to Datasets
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <input
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
            placeholder="Chart name..."
            className="text-xl font-semibold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-2 py-1 transition-colors"
          />
          <input
            value={chartDescription}
            onChange={(e) => setChartDescription(e.target.value)}
            placeholder="Chart description (optional)..."
            className="text-sm text-gray-600 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-2 py-1 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/datasets')}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSaveChart}
            disabled={saving || !selectedDimension || !selectedMeasure}
            className="bg-blue-600 hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Chart'}
          </Button>
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 font-medium flex items-center gap-2"
            onClick={() => router.push('/dashboards/new')}
          >
            Next: Dashboard →
          </Button>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-xs font-medium overflow-x-auto flex-wrap">
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Import</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Explore</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Clean</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Model</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(255,255,255,0.8)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>● Charts</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(209,213,219,0.5)', borderRadius: '3px' }}>○ Dashboard</span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-6 p-6">
        {/* Left Panel - Configuration */}
        <Card className="w-80 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Chart Configuration</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            {/* Chart Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Chart Type</label>
              <div className="grid grid-cols-2 gap-2">
                {CHART_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setChartType(type.id)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        chartType === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-xs font-medium text-center">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dimension Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dimension (X-Axis)
              </label>
              <select
                value={selectedDimension}
                onChange={(e) => setSelectedDimension(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="">Select a column...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Measure Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Measure (Y-Axis)
              </label>
              <select
                value={selectedMeasure}
                onChange={(e) => setSelectedMeasure(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="">Select a column...</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Right Panel - Preview */}
        <Card className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-800">Preview</h2>
          </div>

          <div className="flex-1 overflow-hidden p-6">
            {selectedDimension && selectedMeasure && datasetData.length > 0 ? (
              <ChartRenderer
                data={datasetData}
                chartType={chartType as 'bar' | 'line' | 'pie' | 'area'}
                dimensionColumn={selectedDimension}
                measureColumn={selectedMeasure}
                title={`${selectedMeasure} by ${selectedDimension}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="mb-2">Select both a Dimension and Measure to see preview</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
