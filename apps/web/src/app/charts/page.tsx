'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BarChart3, Trash2, Edit, Loader2 } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { ChartService } from '@/lib/services/ChartService';

interface Chart {
  id: string;
  name: string;
  dataset_id: string;
  chart_type: string;
  created_at: string;
}

export default function ChartsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
    fetchCharts();
  }, [router]);

  const fetchCharts = async () => {
    setLoading(true);
    try {
      const data = await ChartService.listCharts(0, 100);
      setCharts(data || []);
      setError('');
    } catch (err) {
      setError('Failed to load charts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete chart "${name}"?`)) return;
    
    try {
      await ChartService.deleteChart(id);
      setCharts(charts.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete chart');
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6f7' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#2d8659',
          color: 'white',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>📈 Charts</h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>Create and manage your data visualizations</p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Create Button */}
        <button
          onClick={() => router.push('/charts/new')}
          style={{
            backgroundColor: '#2d8659',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1f6a48')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2d8659')}
        >
          <Plus size={20} />
          Create Chart
        </button>

        {/* Error Message */}
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

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Loader2 size={32} style={{ margin: '0 auto', color: '#2d8659', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading charts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && charts.length === 0 && (
          <div style={{ backgroundColor: 'white', padding: '48px 32px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <BarChart3 size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>No charts yet</p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>Create your first chart to visualize your data</p>
          </div>
        )}

        {/* Charts Grid */}
        {!loading && charts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {charts.map((chart) => (
              <div
                key={chart.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseOver={(e) => (e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)')}
                onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    backgroundColor: '#f3f4f6',
                    padding: '48px 24px',
                    textAlign: 'center',
                    borderBottom: '1px solid #e5e7eb',
                    minHeight: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart3 size={64} style={{ color: '#d1d5db' }} />
                </div>

                {/* Content */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>{chart.name}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px 0' }}>
                    Type: {chart.chart_type}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px 0' }}>
                    Created {formatDate(chart.created_at)}
                  </p>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      onClick={() => router.push(`/charts/${chart.id}/edit`)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(chart.id, chart.name)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
