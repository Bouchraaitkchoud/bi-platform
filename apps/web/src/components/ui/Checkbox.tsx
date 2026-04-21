'use client';

import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px' }}>
            <input
              ref={ref}
              type="checkbox"
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
                borderRadius: '4px',
                border: `2px solid ${error ? '#ef4444' : '#d1d5db'}`,
                backgroundColor: (props as any).checked ? '#3b82f6' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              {(props as any).checked && <Check size={14} color="white" strokeWidth={3} />}
            </div>
          </div>
          {label && <span style={{ fontSize: '14px', color: '#374151' }}>{label}</span>}
        </label>
        {error && <span style={{ fontSize: '12px', color: '#ef4444' }}>{error}</span>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
