'use client';

import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, ...props }: TextAreaProps) {
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
      <textarea
        {...props}
        style={{
          width: '100%',
          border: `1px solid ${error ? '#fca5a5' : '#e5e7eb'}`,
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '14px',
          outline: 'none',
          fontFamily: 'inherit',
          minHeight: '100px',
          boxSizing: 'border-box',
          ...props.style,
        }}
      />
      {error && (
        <p style={{ fontSize: '12px', color: '#dc2626', margin: '6px 0 0 0' }}>{error}</p>
      )}
    </div>
  );
}
