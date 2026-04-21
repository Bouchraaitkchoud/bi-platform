'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '6px',
            color: '#374151',
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${error ? '#fca5a5' : '#e5e7eb'}`,
          borderRadius: '8px',
          paddingLeft: icon ? '12px' : '0',
          backgroundColor: 'white',
        }}
      >
        {icon && <span style={{ marginRight: '8px', color: '#6b7280' }}>{icon}</span>}
        <input
          {...props}
          style={{
            flex: 1,
            border: 'none',
            padding: '10px 12px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'transparent',
            ...props.style,
          }}
        />
      </div>
      {error && (
        <p style={{ fontSize: '12px', color: '#dc2626', margin: '6px 0 0 0' }}>{error}</p>
      )}
    </div>
  );
}
