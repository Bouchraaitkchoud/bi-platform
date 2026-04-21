'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { DashboardService } from '@/lib/services/DashboardService';

export default function CreateDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const [newDashboardId, setNewDashboardId] = useState('');

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Dashboard name is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const layout = {
        columns: 12,
        widgets: [],
      };
      
      const result = await DashboardService.createDashboard(name, description, layout, []);
      setNewDashboardId(result.id);
      setCreated(true);
      
      setTimeout(() => {
        router.push(`/dashboards/${result.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dashboard');
      setSaving(false);
    }
  };

  if (isLoading) return null;

  if (created) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f6f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '48px 32px', maxWidth: '500px', textAlign: 'center' }}>
          <CheckCircle size={64} style={{ margin: '0 auto 24px', color: '#16a34a' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>🎉 Workflow Complete!</h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px 0', lineHeight: '1.6' }}>
            Your dashboard "{name}" has been created successfully. You've completed the entire data workflow:
          </p>
          
          <div style={{ backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '16px', margin: '24px 0', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
              <span style={{ color: '#374151' }}>Imported & explored data</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
              <span style={{ color: '#374151' }}>Cleaned & transformed data</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
              <span style={{ color: '#374151' }}>Modeled relationships & measures</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
              <span style={{ color: '#374151' }}>Created visualizations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
              <span style={{ color: '#374151' }}>Built your dashboard</span>
            </div>
          </div>
          
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '16px 0' }}>Redirecting in 2 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6f7' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#2d8659',
          color: 'white',
          padding: '24px 32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <button
            onClick={() => router.back()}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>📊 Create Dashboard</h1>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Final step: Design your analytical dashboard</p>
          </div>
        </div>
        
        {/* Workflow Progress */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', opacity: 0.9, marginTop: '16px' }}>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>✓ Import</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>✓ Explore</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>✓ Clean</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>✓ Model</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>✓ Charts</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.8)', color: '#2d8659', fontWeight: 'bold', borderRadius: '4px' }}>● Dashboard</span>
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '32px' }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                marginBottom: '24px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                Dashboard Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sales Performance"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this dashboard about?"
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#e5e7eb',
                  color: '#1f2937',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '10px 24px',
                  backgroundColor: saving ? '#9ca3af' : '#2d8659',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                {saving ? 'Creating...' : 'Create Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
