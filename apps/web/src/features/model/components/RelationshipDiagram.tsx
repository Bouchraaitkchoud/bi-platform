'use client';

import React, { useCallback, useState } from 'react';
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

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 250, y: 5 },
    data: { label: 'Sales (Fact)' },
    style: { border: '2px solid #3b82f6', borderRadius: '8px', padding: '10px' }
  },
  {
    id: '2',
    position: { x: 100, y: 150 },
    data: { label: 'Customers (Dimension)' },
    style: { border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }
  },
  {
    id: '3',
    position: { x: 400, y: 150 },
    data: { label: 'Products (Dimension)' },
    style: { border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '2', target: '1', animated: true, label: '1:*' },
  { id: 'e1-3', source: '3', target: '1', animated: true, label: '1:*' },
];

export function RelationshipDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
