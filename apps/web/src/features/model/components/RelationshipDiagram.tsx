'use client';

import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DatasetService } from '@/lib/services/DatasetService';
import { WarehouseService } from '@/lib/services/WarehouseService';

interface RelationshipDiagramProps {
  datasetId?: string;
  warehouseId?: string;
}

export function RelationshipDiagram({ datasetId, warehouseId }: RelationshipDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!warehouseId && !datasetId) {
        setLoading(false);
        return;
      }

      try {
        if (warehouseId) {
          // Load warehouse with all tables and relationships
          const warehouse = await WarehouseService.getWarehouse(warehouseId);
          const diagramNodes: Node[] = [];
          const diagramEdges: Edge[] = [];

          // Create nodes for each table
          const tables = warehouse.tables || [];

          const spacing = 350;
          const cols = Math.ceil(Math.sqrt(tables.length));

          tables.forEach((table: any, idx: number) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const x = col * spacing + 50;
            const y = row * spacing + 50;

            // Get columns from table schema - convert columns_metadata object to array
            let columns: any[] = [];
            if (table.columns_metadata && typeof table.columns_metadata === 'object') {
              columns = Object.keys(table.columns_metadata).map((colName) => ({
                name: colName,
                type: table.columns_metadata[colName].type,
                is_primary_key: false,
              }));
            }

            const tableName = table.name || table.table_name;

            const node: Node = {
              id: table.id,
              position: { x, y },
              data: {
                label: (
                  <div className="flex flex-col" style={{ minWidth: '220px', maxHeight: '400px' }}>
                    {/* Table Header */}
                    <div className="bg-blue-600 text-white px-3 py-2 font-semibold text-sm rounded-t">
                      {tableName}
                    </div>
                    {/* Columns List */}
                    <div className="bg-white border border-blue-300 rounded-b overflow-y-auto" style={{ maxHeight: '350px' }}>
                      {columns.length > 0 ? (
                        columns.map((col: any, i: number) => (
                          <div
                            key={col.name || i}
                            className="px-3 py-1.5 text-xs border-b border-blue-100 hover:bg-blue-50 font-mono"
                            style={{
                              borderBottom:
                                i === columns.length - 1
                                  ? 'none'
                                  : '1px solid #dbeafe',
                            }}
                          >
                            <span
                              className={
                                col.is_primary_key
                                  ? 'font-bold text-blue-700'
                                  : 'text-gray-700'
                              }
                            >
                              {col.is_primary_key ? '🔑 ' : ''}
                              {col.name || col}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-gray-500">
                          {table.column_count || 0} columns
                        </div>
                      )}
                    </div>
                    {/* Table Stats */}
                    <div className="bg-gray-50 border-t border-blue-200 px-3 py-1 text-xs text-gray-600 rounded-b">
                      {table.row_count?.toLocaleString() || 0} rows
                    </div>
                  </div>
                ),
              },
              style: {
                border: 'none',
                borderRadius: '4px',
                padding: '0',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              },
            };
            diagramNodes.push(node);
          });

          // Create edges for relationships
          const relationships = warehouse.relationships || [];
          relationships.forEach((rel: any, idx: number) => {
            const fromTable = tables.find(
              (t: any) => (t.name || t.table_name) === rel.from_table_name
            );
            const toTable = tables.find(
              (t: any) => (t.name || t.table_name) === rel.to_table_name
            );

            if (fromTable && toTable) {
              // Extract cardinality (1:1, 1:*, *:1, *:*)
              const cardinality = rel.cardinality || '1:*';
              const [fromCard, toCard] = cardinality.split(':');

              const edge: Edge = {
                id: `rel-${idx}-${fromTable.id}-${toTable.id}`,
                source: fromTable.id,
                target: toTable.id,
                label: `${rel.from_column} → ${rel.to_column}\n${fromCard}:${toCard}`,
                animated: rel.is_auto_detected,
                style: {
                  strokeWidth: 2.5,
                  stroke: rel.is_auto_detected ? '#0891b2' : '#94a3b8',
                },
                markerEnd: {
                  type: 'arrowclosed',
                  color: rel.is_auto_detected ? '#0891b2' : '#94a3b8',
                },
                labelStyle: {
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '3px',
                  border: '1px solid #0891b2',
                  whiteSpace: 'pre',
                },
              };
              diagramEdges.push(edge);
            }
          });

          setNodes(diagramNodes);
          setEdges(diagramEdges);
        } else if (datasetId) {
          // Load single dataset (existing behavior)
          const preview = await DatasetService.getDatasetPreview(datasetId, 10);
          if (preview.data && preview.data.length > 0) {
            const columns = Object.keys(preview.data[0]);

            const tableNode: Node = {
              id: '1',
              position: { x: 250, y: 50 },
              data: {
                label: (
                  <div className="flex flex-col gap-2">
                    <div className="font-semibold text-blue-700">Dataset Columns</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {columns.slice(0, 8).map((col) => (
                        <div
                          key={col}
                          className="px-2 py-1 bg-blue-50 rounded truncate"
                        >
                          {col}
                        </div>
                      ))}
                      {columns.length > 8 && (
                        <div className="text-gray-500">
                          +{columns.length - 8} more...
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              style: {
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                padding: '12px',
                minWidth: '280px',
                backgroundColor: '#f0f9ff',
              },
            };

            setNodes([tableNode]);
            setEdges([]);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [warehouseId, datasetId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap zoomable pannable nodeColor={(node) => (node.style?.borderColor as string) || '#eee'} />
        <Background color="#f1f5f9" gap={16} />
      </ReactFlow>
    </div>
  );
}
