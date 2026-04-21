'use client';

import React, { useState } from 'react';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked = false, onChange, label, disabled = false }: ToggleProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;
    const newState = !isChecked;
    setIsChecked(newState);
    onChange?.(newState);
  };

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <div
        onClick={handleToggle}
        style={{
          width: '44px',
          height: '24px',
          backgroundColor: isChecked ? '#3b82f6' : '#d1d5db',
          borderRadius: '12px',
          position: 'relative',
          transition: 'background-color 0.3s ease',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: isChecked ? '22px' : '2px',
            transition: 'left 0.3s ease',
          }}
        />
      </div>
      {label && <span style={{ fontSize: '14px', color: '#374151' }}>{label}</span>}
    </label>
  );
}
