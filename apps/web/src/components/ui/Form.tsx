'use client';

import React, { ReactNode } from 'react';

export interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[];
}

interface FormProps {
  onSubmit: (formData: Record<string, any>) => void | Promise<void>;
  fields: FormFieldProps[];
  submitLabel?: string;
}

export function Form({ onSubmit, fields, submitLabel = 'Submit' }: FormProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error: any) {
      if (error.fieldErrors) {
        setErrors(error.fieldErrors);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {fields.map((field) => (
        <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor={field.name}
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
            }}
          >
            {field.label}
            {field.required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${errors[field.name] ? '#ef4444' : '#d1d5db'}`,
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
              rows={4}
            />
          ) : field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${errors[field.name] ? '#ef4444' : '#d1d5db'}`,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.name}
              name={field.name}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${errors[field.name] ? '#ef4444' : '#d1d5db'}`,
                fontSize: '14px',
              }}
            />
          )}

          {errors[field.name] && (
            <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors[field.name]}</span>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '10px 16px',
          borderRadius: '6px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          fontSize: '14px',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Loading...' : submitLabel}
      </button>
    </form>
  );
}
