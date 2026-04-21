'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, LineChart, PieChart, LayoutDashboard, Settings2, Save } from 'lucide-react';

const ItemTypes = {
  FIELD: 'field',
};

// Draggable Field from Dataset
function FieldItem({ name, type }: { name: string; type: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FIELD,
    item: { name, type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Create a ref function to satisfy the return type of useDrag and TypeScript
  const dragRef = (node: HTMLDivElement | null) => {
    drag(node);
  };

  return (
    <div
      ref={dragRef}
      className={`px-3 py-2 text-sm bg-white border rounded cursor-move transition-all duration-200 hover:border-blue-400 hover:shadow-sm flex items-center justify-between ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={type === 'measure' ? 'text-blue-500 font-bold' : 'text-gray-400'}>
          {type === 'measure' ? '∑' : '#'}
        </span>
        <span className="font-medium text-gray-700">{name}</span>
      </div>
    </div>
  );
}

// Drop zone for Chart Axis
function AxisDropZone({ title, acceptedItems, onDrop, items }: any) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.FIELD,
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  const dropRef = (node: HTMLDivElement | null) => {
    drop(node);
  };

  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{title}</h4>
      <div
        ref={dropRef}
        className={`min-h-[40px] rounded border-2 border-dashed p-2 transition-colors ${
          isOver ? 'border-blue-500 bg-blue-50' : canDrop ? 'border-gray-300 bg-gray-50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        {items.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-1">Drop fields here</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item: any) => (
              <div key={item.name} className="px-2 py-1 bg-white border border-gray-300 rounded text-xs flex items-center shadow-sm">
                <span>{item.name}</span>
                <button className="ml-1 text-gray-400 hover:text-red-500 text-xs translate-y-[-1px]">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReportBuilder() {
  const router = useRouter();
  const [xAxis, setXAxis] = useState<any[]>([]);
  const [yAxis, setYAxis] = useState<any[]>([]);
  const [chartType, setChartType] = useState('bar');

  // Dummy fields for preview
  const fields = [
    { name: 'Date', type: 'dimension' },
    { name: 'Product Category', type: 'dimension' },
    { name: 'Region', type: 'dimension' },
    { name: 'Sales Amount', type: 'measure' },
    { name: 'Profit Margin', type: 'measure' },
    { name: 'Order Count', type: 'measure' },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
        
        {/* Left Sidebar: Visualizations & Formats */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Visualizations</h2>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => setChartType('bar')} className={`p-2 rounded hover:bg-gray-100 flex items-center justify-center transition-colors ${chartType === 'bar' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 border border-transparent'}`}>
                <BarChart3 size={20} />
              </button>
              <button onClick={() => setChartType('line')} className={`p-2 rounded hover:bg-gray-100 flex items-center justify-center transition-colors ${chartType === 'line' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 border border-transparent'}`}>
                <LineChart size={20} />
              </button>
              <button onClick={() => setChartType('pie')} className={`p-2 rounded hover:bg-gray-100 flex items-center justify-center transition-colors ${chartType === 'pie' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 border border-transparent'}`}>
                <PieChart size={20} />
              </button>
              <button className="p-2 rounded hover:bg-gray-100 text-gray-600 border border-transparent flex items-center justify-center"><LayoutDashboard size={20} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <AxisDropZone 
              title="X-Axis (Dimensions)" 
              items={xAxis} 
              onDrop={(item: any) => setXAxis([item])} 
            />
            <AxisDropZone 
              title="Y-Axis (Measures)" 
              items={yAxis} 
              onDrop={(item: any) => setYAxis([item])} 
            />
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Settings2 size={14} /> Format Visual
              </h4>
              <div className="text-sm text-gray-400 p-2 text-center border border-dashed rounded bg-white mt-2">
                Select visual to format
              </div>
            </div>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col relative bg-[#f3f4f6]">
          {/* Top Ribbon */}
          <div className="h-14 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 z-10 w-full shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <input 
                className="text-lg font-semibold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-1 py-0.5 transition-colors" 
                defaultValue="Untitled Report"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboards')}>Cancel</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-medium tracking-wide flex items-center gap-2 shadow-sm">
                <Save size={16} /> Save Chart
              </Button>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 font-medium tracking-wide flex items-center gap-2 shadow-sm" onClick={() => router.push('/dashboards/new')}>
                Next: Dashboard →
              </Button>
            </div>
          </div>
          
          {/* Workflow Progress */}
          <div className="px-6 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-xs font-medium overflow-x-auto flex-wrap">
            <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Import</span>
            <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Explore</span>
            <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Clean</span>
            <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Model</span>
            <span style={{ padding: '1px 6px', backgroundColor: 'rgba(255,255,255,0.8)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>● Charts</span>
            <span style={{ padding: '1px 6px', backgroundColor: 'rgba(209,213,219,0.5)', borderRadius: '3px' }}>○ Dashboard</span>
          </div>
          
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            {xAxis.length === 0 || yAxis.length === 0 ? (
              <div className="text-center w-full max-w-md p-10 bg-white/50 border-2 border-dashed border-gray-300 rounded-xl">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Build your visual</h3>
                <p className="text-sm text-gray-500">
                  Select or drag fields from the Data pane onto the canvas or visualization buckets.
                </p>
              </div>
            ) : (
              <Card className="w-full max-w-4xl h-[500px] flex flex-col shadow-lg border-gray-200 bg-white">
                <div className="px-4 py-3 border-b flex justify-between items-center text-gray-800">
                  <h3 className="font-semibold text-center w-full">{yAxis[0]?.name} by {xAxis[0]?.name}</h3>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-end border-b border-gray-100 chart-preview-area">
                  <div className="w-full h-full border-l-2 border-b-2 border-gray-400 flex items-end justify-around pb-0 relative">
                     {/* Fake Chart Bars for Preview */}
                     {[40, 70, 45, 90, 65].map((h, i) => (
                       <div key={i} className="w-16 bg-blue-500 mx-2 hover:bg-blue-600 transition-colors rounded-t-sm shadow-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                          <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-10">
                            {h * 100}
                          </div>
                       </div>
                     ))}
                  </div>
                  <div className="w-full flex justify-around mt-4 text-sm font-medium text-gray-600">
                    <span>Dim 1</span>
                    <span>Dim 2</span>
                    <span>Dim 3</span>
                    <span>Dim 4</span>
                    <span>Dim 5</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right Sidebar: Data Fields */}
        <div className="w-72 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Data</h2>
            <div className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">Sales Dataset</div>
          </div>
          <div className="p-2 border-b border-gray-100">
            <input 
              type="text" 
              placeholder="Search fields" 
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-gray-50/30">
            {fields.map((field) => (
              <FieldItem key={field.name} name={field.name} type={field.type} />
            ))}
          </div>
        </div>
        
      </div>
    </DndProvider>
  );
}
