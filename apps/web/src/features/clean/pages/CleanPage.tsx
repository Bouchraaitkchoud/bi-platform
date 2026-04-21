'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/stores/authStore';
import { useDatasetStore } from '@/stores/datasetStore';
import { DatasetService } from '@/lib/services/DatasetService';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { Settings2, X, Plus, Filter, Type, Trash2, SplitSquareHorizontal, Combine, Undo2, ChevronDown, ChevronUp } from 'lucide-react';

interface CleanPageProps {
  datasetId?: string;
}

export const CleanPage: React.FC<CleanPageProps> = ({ datasetId }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const activeDataset = useDatasetStore((state) => state.activeDataset);
  
  const [rowData, setRowData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentDatasetId = datasetId || activeDataset?.id;

  const [appliedSteps, setAppliedSteps] = useState([
    { id: '1', name: 'Source', icon: <Settings2 size={14}/> },
    { id: '2', name: 'Promoted Headers', icon: <Settings2 size={14}/> },
    { id: '3', name: 'Changed Type', icon: <Type size={14}/> }
  ]);

  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [transformMessage, setTransformMessage] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const loadPreview = async () => {
      if (!currentDatasetId) {
        console.warn('No dataset ID provided');
        setError('No dataset selected. Please select a dataset from the Datasets page.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const preview = await DatasetService.getDatasetPreview(currentDatasetId, 50);
        if (preview && preview.data && preview.data.length > 0) {
          setRowData(preview.data);
          const cols = Object.keys(preview.data[0]);
          setColumns(cols);
        } else {
          console.warn('No preview data available');
          setError('No data available in this dataset');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load dataset preview';
        console.error("Failed to load preview data", err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    loadPreview();
  }, [currentDatasetId]);

  // Transformation functions
  const dropNulls = () => {
    const filteredData = rowData.filter(row => 
      Object.values(row).every(val => val !== null && val !== undefined && val !== '')
    );
    setRowData(filteredData);
    addStep('Removed Nulls', <Trash2 size={14}/>);
    setTransformMessage(`Removed rows with null values. ${rowData.length - filteredData.length} rows deleted.`);
  };

  const dropDuplicates = () => {
    const uniqueRows = Array.from(new Map(
      rowData.map(row => [JSON.stringify(row), row])
    ).values());
    const removed = rowData.length - uniqueRows.length;
    setRowData(uniqueRows);
    addStep('Removed Duplicates', <Trash2 size={14}/>);
    setTransformMessage(`Removed duplicate rows. ${removed} rows deleted.`);
  };

  const removeColumn = (colName: string) => {
    const newData = rowData.map(row => {
      const newRow = { ...row };
      delete newRow[colName];
      return newRow;
    });
    setRowData(newData);
    setColumns(columns.filter(c => c !== colName));
    addStep(`Removed Column: ${colName}`, <Trash2 size={14}/>);
    setTransformMessage(`Column "${colName}" removed.`);
  };

  const convertToUppercase = (colName: string) => {
    const newData = rowData.map(row => ({
      ...row,
      [colName]: row[colName]?.toString().toUpperCase() || row[colName]
    }));
    setRowData(newData);
    addStep(`Converted to Uppercase: ${colName}`, <Type size={14}/>);
    setTransformMessage(`Column "${colName}" converted to uppercase.`);
  };

  const convertToLowercase = (colName: string) => {
    const newData = rowData.map(row => ({
      ...row,
      [colName]: row[colName]?.toString().toLowerCase() || row[colName]
    }));
    setRowData(newData);
    addStep(`Converted to Lowercase: ${colName}`, <Type size={14}/>);
    setTransformMessage(`Column "${colName}" converted to lowercase.`);
  };

  const trimWhitespace = (colName: string) => {
    const newData = rowData.map(row => ({
      ...row,
      [colName]: typeof row[colName] === 'string' ? row[colName].trim() : row[colName]
    }));
    setRowData(newData);
    addStep(`Trimmed Whitespace: ${colName}`, <Type size={14}/>);
    setTransformMessage(`Whitespace trimmed from column "${colName}".`);
  };

  const addStep = (stepName: string, icon: any) => {
    setAppliedSteps([...appliedSteps, { id: Date.now().toString(), name: stepName, icon }]);
  };

  const removeStep = (index: number) => {
    setAppliedSteps(appliedSteps.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">⚠️ Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={() => router.push('/datasets')} className="bg-blue-600 hover:bg-blue-700">
            Back to Datasets
          </Button>
        </div>
      </div>
    );
  }

  if (!currentDatasetId) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Dataset Selected</h2>
          <p className="text-gray-600 mb-4">Please select a dataset from the Datasets page</p>
          <Button onClick={() => router.push('/datasets')} className="bg-blue-600 hover:bg-blue-700">
            Go to Datasets
          </Button>
        </div>
      </div>
    );
  }

  if (columns.length === 0 && rowData.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">The dataset appears to be empty or could not be loaded</p>
          <Button onClick={() => router.push('/datasets')} className="bg-blue-600 hover:bg-blue-700">
            Back to Datasets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 font-sans">
      {/* Top Ribbon (Power Query Style) */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex flex-col z-10 w-full shrink-0">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-gray-800 tracking-tight">Power Query Editor</h1>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">{activeDataset?.name || 'Dataset'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-7 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700" onClick={() => router.push('/datasets')}>Close</Button>
            <Button size="sm" className="h-7 text-xs bg-blue-500 hover:bg-blue-600 text-white border-none px-4" onClick={() => router.push(`/datasets/${currentDatasetId}/model`)}>
              Next: Modeling \u2192
            </Button>
            <Button size="sm" className="h-7 text-xs bg-[#f3c11b] hover:bg-[#d6a80f] text-gray-900 border-none px-4" onClick={() => router.push(`/datasets/${currentDatasetId}/model`)}>
              Close & Apply
            </Button>
          </div>
        </div>
        
        {/* Workflow Progress */}
        <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center gap-2 text-xs font-medium overflow-x-auto">
          <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Import</span>
          <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Explore</span>
          <span style={{ padding: '1px 6px', backgroundColor: 'rgba(255,255,255,0.8)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>● Clean</span>
          <span style={{ padding: '1px 6px', backgroundColor: 'rgba(209,213,219,0.5)', borderRadius: '3px' }}>○ Model</span>
          <span style={{ padding: '1px 6px', backgroundColor: 'rgba(209,213,219,0.5)', borderRadius: '3px' }}>○ Charts</span>
          <span style={{ padding: '1px 6px', backgroundColor: 'rgba(209,213,219,0.5)', borderRadius: '3px' }}>○ Dashboard</span>
        </div>
        
        {/* Ribbon Tools */}
        <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 overflow-x-auto">
          <div className="flex flex-col gap-1 items-center px-3 border-r border-gray-200">
            <div className="flex gap-1">
              <button onClick={dropNulls} title="Remove rows with null values" className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-200 text-gray-700 min-w-[70px]">
                <Trash2 size={24} className="mb-1 text-red-500" />
                <span className="text-[10px]">Drop Nulls</span>
              </button>
              <button onClick={dropDuplicates} title="Remove duplicate rows" className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-200 text-gray-700 min-w-[70px]">
                <Filter size={24} className="mb-1 text-blue-500" />
                <span className="text-[10px]">No Duplicates</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 items-center px-3 border-r border-gray-200">
            <div className="flex gap-1">
              <button 
                onClick={() => columns.length > 0 && convertToUppercase(columns[0])}
                title="Convert text to uppercase" 
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-200 text-gray-700 min-w-[70px]"
              >
                <Type size={24} className="mb-1 text-purple-500" />
                <span className="text-[10px]">Uppercase</span>
              </button>
              <button 
                onClick={() => columns.length > 0 && convertToLowercase(columns[0])}
                title="Convert text to lowercase"
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-200 text-gray-700 min-w-[70px]"
              >
                <Type size={24} className="mb-1 text-green-500" />
                <span className="text-[10px]">Lowercase</span>
              </button>
              <button 
                onClick={() => columns.length > 0 && trimWhitespace(columns[0])}
                title="Trim whitespace"
                className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-200 text-gray-700 min-w-[70px]"
              >
                <Settings2 size={24} className="mb-1 text-orange-500" />
                <span className="text-[10px]">Trim</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Transformation Message */}
        {transformMessage && (
          <div className="px-4 py-2 bg-green-50 border-t border-green-200 text-sm text-green-700 font-medium flex items-center gap-2">
            <span>✓</span>
            <span>{transformMessage}</span>
            <button 
              onClick={() => setTransformMessage('')}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Formula Bar */}
        <div className="px-4 py-1.5 bg-white border-t border-gray-200 flex items-center gap-2">
          <span className="text-gray-400 font-serif italic text-sm font-semibold">fx</span>
          <div className="flex-1 bg-gray-50 border border-gray-300 rounded px-2 py-1 flex items-center">
             <span className="text-xs font-mono text-gray-600">Data Transformation In Progress</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Queries Pane (Optional, minimizing implementation for now) */}
        
        {/* Center Canvas - Data Table */}
        <div className="flex-1 overflow-hidden bg-white border-r border-gray-200">
          <div className="h-full overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <span>{col}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    {columns.map((col) => (
                      <td
                        key={`${rowIdx}-${col}`}
                        className="px-4 py-2 text-gray-700 border-r border-gray-200 font-mono text-xs"
                      >
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-gray-400 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar - Query Settings */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm shrink-0">
          <div className="p-3 border-b border-gray-200 bg-blue-50/50">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-widest text-center">Query Settings</h2>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Properties</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Name</label>
              <input type="text" className="w-full text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500" defaultValue="Sales Data" />
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applied Steps</h3>
              <Undo2 size={14} className="text-gray-400 cursor-pointer hover:text-blue-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-white flex flex-col gap-1">
              {appliedSteps.map((step, idx) => (
                <div key={step.id} className="group flex items-center justify-between p-2 border border-transparent hover:border-gray-200 hover:bg-gray-50 rounded cursor-pointer transition-colors max-w-full">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                     <span className="text-gray-400 shrink-0">{step.icon}</span>
                     <span className="text-sm text-gray-700 font-medium truncate">{step.name}</span>
                  </div>
                  {idx > 0 && (
                    <button onClick={() => removeStep(idx)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-gray-400 transition-opacity">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
