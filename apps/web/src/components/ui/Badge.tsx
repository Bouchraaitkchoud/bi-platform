'use client';

import React, { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variantStyles = {
    default: {
      bg: '#f3f4f6',
      text: '#374151',
      border: '#e5e7eb',
    },
    primary: {
      bg: '#eff6ff',
      text: '#1e40af',
      border: '#bfdbfe',
    },
    success: {
      bg: '#ecfdf5',
      text: '#065f46',
      border: '#d1fae5',
    },
    warning: {
      bg: '#fffbeb',
      text: '#78350f',
      border: '#fef3c7',
    },
    error: {
      bg: '#fef2f2',
      text: '#7f1d1d',
      border: '#fee2e2',
    },
    info: {
      bg: '#eff6ff',
      text: '#1e40af',
      border: '#bfdbfe',
    },
    outline: {
      bg: 'transparent',
      text: '#6b7280',
      border: '#d1d5db',
    },
  };

  const sizeMap = {
    sm: { padding: '2px 8px', fontSize: '12px' },
    md: { padding: '4px 12px', fontSize: '13px' },
    lg: { padding: '6px 16px', fontSize: '14px' },
  };

  const style = variantStyles[variant];
  const sizeStyle = sizeMap[size];

  return (
    <span
      className={className}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        borderRadius: '16px',
        display: 'inline-block',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        ...sizeStyle,
      }}
    >
      {children}
    </span>
  );
}
