'use client';

import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  title?: string;
  message?: string;
  closable?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
}

export function Alert({ type, title, message, closable = false, onClose, children, className = '' }: AlertProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const config = {
    success: {
      bg: '#ecfdf5',
      border: '#d1fae5',
      icon: CheckCircle,
      iconColor: '#10b981',
      textColor: '#065f46',
    },
    error: {
      bg: '#fef2f2',
      border: '#fee2e2',
      icon: AlertCircle,
      iconColor: '#ef4444',
      textColor: '#7f1d1d',
    },
    warning: {
      bg: '#fffbeb',
      border: '#fef3c7',
      icon: AlertTriangle,
      iconColor: '#f59e0b',
      textColor: '#78350f',
    },
    info: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      icon: Info,
      iconColor: '#3b82f6',
      textColor: '#1e40af',
    },
  };

  const alertConfig = config[type];
  const IconComponent = alertConfig.icon;

  return (
    <div
      className={className}
      style={{
        backgroundColor: alertConfig.bg,
        border: `1px solid ${alertConfig.border}`,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <IconComponent size={20} color={alertConfig.iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />

      <div style={{ flex: 1 }}>
        {title && (
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: alertConfig.textColor, margin: '0 0 4px 0' }}>
            {title}
          </h3>
        )}
        {message && (
          <p style={{ fontSize: '14px', color: alertConfig.textColor, margin: title ? 0 : '0', opacity: 0.9 }}>
            {message}
          </p>
        )}
        {children}
      </div>

      {closable && (
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: alertConfig.textColor,
            padding: 0,
            flexShrink: 0,
          }}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
