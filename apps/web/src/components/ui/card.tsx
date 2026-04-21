'use client';

import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  padding?: number;
  shadow?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, title, subtitle, padding = 24, shadow = true, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: shadow ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
        padding,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {title && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
