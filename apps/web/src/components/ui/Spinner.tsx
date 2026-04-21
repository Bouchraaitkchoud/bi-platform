'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function Spinner({ size = 'md', color = '#3b82f6', className = '' }: SpinnerProps) {
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  const dimension = sizeMap[size];

  return (
    <div
      className={className}
      style={{
        width: dimension,
        height: dimension,
        border: `3px solid ${color}20`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
