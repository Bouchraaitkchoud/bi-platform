'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { RelationshipDiagram } from '../components/RelationshipDiagram';

interface ModelPageProps {
  datasetId: string;
}

export function ModelPage({ datasetId }: ModelPageProps) {
  const [activeTab, setActiveTab] = useState('relationships');
  const router = useRouter();

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Ribbon (Power BI style) */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-10 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">
              M
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Model View</h1>
          </div>
          <div className="h-6 border-l border-gray-300 mx-2"></div>
          <div className="flex space-x-1">
            {(['relationships', 'measures'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'relationships' ? 'Relationships' : 'Measures (DAX)'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
          {activeTab === 'relationships' && (
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Manage Relationships
            </Button>
          )}
          {activeTab === 'measures' && (
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              New Measure
            </Button>
          )}
          <div className="h-6 border-l border-gray-300 mx-1"></div>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            onClick={() => router.push(`/charts/new?datasetId=${datasetId}`)}
          >
            Next: Create Charts
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
      
      {/* Workflow Progress */}
      <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-xs font-medium overflow-x-auto flex-wrap">
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Import</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Explore</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(45, 134, 89, 0.2)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>✓ Clean</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(255,255,255,0.8)', color: '#2d8659', fontWeight: 'bold', borderRadius: '3px' }}>● Model</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(209,213,219,0.5)', borderRadius: '3px' }}>○ Charts</span>
        <span style={{ padding: '1px 6px', backgroundColor: 'rgba(209,213,219,0.5)', borderRadius: '3px' }}>○ Dashboard</span>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        {activeTab === 'relationships' && (
          <div className="h-full flex flex-col pt-2 pb-4">
            <div className="flex-1 min-h-0">
              <RelationshipDiagram />
            </div>
          </div>
        )}

        {activeTab === 'measures' && (
          <div className="h-full flex gap-6 pt-2 pb-4">
            <Card className="w-1/3 flex flex-col overflow-hidden bg-white">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Fields & Measures</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                <div className="text-sm font-medium text-gray-500 mb-1">Sales (Fact)</div>
                <div className="p-2 bg-gray-50 border border-gray-200 rounded text-sm hover:bg-blue-50 cursor-pointer flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">∑</span> Total Revenue
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-200 px-1.5 rounded">Measure</span>
                </div>
                <div className="p-2 border border-transparent hover:bg-gray-50 rounded text-sm cursor-pointer flex items-center">
                  <span className="text-gray-400 mr-2">#</span> OrderAmount
                </div>
              </div>
            </Card>

            <Card className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-gray-200 bg-blue-50/50">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Measure Name</label>
                  <input type="text" defaultValue="Total Revenue" className="p-2 border border-gray-300 rounded font-medium focus:ring-2 focus:ring-blue-500 outline-none w-1/2" />
                </div>
              </div>
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Formula (DAX)</label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-100 border-r border-gray-300 flex justify-center pt-3 text-gray-400 text-sm">
                      1
                    </div>
                    <textarea 
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded min-h-[100px] font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                      defaultValue="SUM(Sales[OrderAmount])"
                      placeholder="e.g., SUM(Table[Column])"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="p-4 flex gap-2">
                <Button className="bg-green-600 hover:bg-green-700 text-white">Save Measure</Button>
                <Button variant="outline">Test Formula</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
