'use client';

import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showLabel?: boolean;
}

export function Progress({ value, max = 100, label, showLabel = false }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {(label || showLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            {label}
          </span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: '#3b82f6',
            width: `${percentage}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
