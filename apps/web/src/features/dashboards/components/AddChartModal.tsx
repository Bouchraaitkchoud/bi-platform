'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2, AlertCircle } from 'lucide-react';
import { DatasetService, Dataset } from '@/lib/services/DatasetService';
import { ChartService } from '@/lib/services/ChartService';
import { Button } from '@/components/ui/button';

interface AddChartModalProps {
  dashboardId: string;
  onClose: () => void;
  onSuccess: (chart: any) => void;
}

const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: '📊' },
  { id: 'line', name: 'Line Chart', icon: '📈' },
  { id: 'area', name: 'Area Chart', icon: '📉' },
  { id: 'scatter', name: 'Scatter', icon: '🔵' },
  { id: 'pie', name: 'Pie Chart', icon: '🥧' },
  { id: 'donut', name: 'Donut', icon: '🍩' },
];

export function AddChartModal({ dashboardId, onClose, onSuccess }: AddChartModalProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [columns, setColumns] = useState<string[]>([]);
  const [datasetData, setDatasetData] = useState<any[]>([]);
  
  const [chartName, setChartName] = useState('New Chart');
  const [chartType, setChartType] = useState('bar');
  const [selectedDimension, setSelectedDimension] = useState('');
  const [selectedMeasure, setSelectedMeasure] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const data = await DatasetService.listDatasets();
        setDatasets(data);
        if (data.length > 0) {
          setSelectedDataset(data[0].id);
        }
      } catch (err) {
        setError('Failed to load datasets');
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  useEffect(() => {
    const loadColumns = async () => {
      if (!selectedDataset) return;
      try {
        setLoading(true);
        const preview = await DatasetService.getDatasetPreview(selectedDataset, 100);
        if (preview && preview.data && preview.data.length > 0) {
          const cols = Object.keys(preview.data[0]);
          setColumns(cols);
          setDatasetData(preview.data);
          if (cols.length > 0) setSelectedDimension(cols[0]);
          if (cols.length > 1) setSelectedMeasure(cols[1]);
        }
      } catch (err) {
        setError('Failed to load columns for dataset');
      } finally {
        setLoading(false);
      }
    };
    loadColumns();
  }, [selectedDataset]);

  const handleSave = async () => {
    if (!selectedDimension || !selectedMeasure) {
      setError('Please select both dimension and measure');
      return;
    }
    setSaving(true);
    try {
      const chartConfig: any = {
        tooltip: { trigger: 'axis' },
        xAxis: { 
          type: 'category', 
          data: datasetData.map(d => String(d[selectedDimension])).slice(0, 50)
        },
        yAxis: { type: 'value' },
        series: [{
          name: selectedMeasure,
          data: datasetData.map(d => parseFloat(d[selectedMeasure]) || 0).slice(0, 50),
          type: chartType === 'donut' ? 'pie' : chartType === 'area' ? 'line' : chartType,
          smooth: chartType === 'line' || chartType === 'area',
          areaStyle: chartType === 'area' ? {} : undefined,
          radius: chartType === 'donut' ? ['40%', '70%'] : undefined,
        }],
      };
      
      if (chartType === 'pie' || chartType === 'donut') {
        chartConfig.tooltip.trigger = 'item';
        delete chartConfig.xAxis;
        delete chartConfig.yAxis;
        chartConfig.series[0].data = datasetData.map(d => ({
          name: String(d[selectedDimension]),
          value: parseFloat(d[selectedMeasure]) || 0
        })).slice(0, 50);
      }
      
      if (chartType === 'scatter') {
        chartConfig.xAxis.type = 'value';
        chartConfig.series[0].data = datasetData.map(d => [
          parseFloat(d[selectedDimension]) || 0,
          parseFloat(d[selectedMeasure]) || 0
        ]).slice(0, 50);
      }

      // Convert chart type to match API expectations if needed
      const apiChartType = (chartType === 'donut' || chartType === 'area') ? chartType.toUpperCase() : chartType.toUpperCase();

      const newChart = await ChartService.createChart(
        chartName,
        '',
        selectedDataset,
        apiChartType,
        chartConfig,
        dashboardId
      );
      
      onSuccess(newChart);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save chart');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Add Chart to Dashboard</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chart Name</label>
            <input 
              value={chartName} 
              onChange={e => setChartName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g. Sales by Region"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Dataset</label>
            <select 
              value={selectedDataset} 
              onChange={e => setSelectedDataset(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a dataset...</option>
              {datasets.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {CHART_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setChartType(type.id)}
                      className={`p-2 border rounded flex items-center justify-center gap-2 ${chartType === type.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <span>{type.icon}</span> <span className="text-sm font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dimension (X-Axis)</label>
                  <select 
                    value={selectedDimension} 
                    onChange={e => setSelectedDimension(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select column...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Measure (Y-Axis)</label>
                  <select 
                    value={selectedMeasure} 
                    onChange={e => setSelectedMeasure(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select column...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !selectedDataset || !selectedDimension} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Add to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
