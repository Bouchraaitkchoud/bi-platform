'use client';

import React, { forwardRef } from 'react';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px' }}>
            <input
              ref={ref}
              type="radio"
              {...props}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                margin: 0,
              }}
            />
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `2px solid ${error ? '#ef4444' : '#d1d5db'}`,
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              {(props as any).checked && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                  }}
                />
              )}
            </div>
          </div>
          {label && <span style={{ fontSize: '14px', color: '#374151' }}>{label}</span>}
        </label>
        {error && <span style={{ fontSize: '12px', color: '#ef4444' }}>{error}</span>}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
