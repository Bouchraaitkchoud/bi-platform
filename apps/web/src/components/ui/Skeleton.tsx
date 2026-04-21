'use client';

import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '20px', circle = false, count = 1, style }: SkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius: circle ? '50%' : '6px',
            backgroundColor: '#e5e7eb',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            marginBottom: idx < count - 1 ? '8px' : '0',
            ...style,
          }}
        >
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      ))}
    </>
  );
}
