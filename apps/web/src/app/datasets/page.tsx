'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Database, Trash2, Eye, Wand2, Loader2 } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { DatasetService } from '@/lib/services/DatasetService';

interface Dataset {
  id: string;
  name: string;
  file_type: string;
  rows: number;
  columns: number;
  size_mb: number;
  created_at: string;
}

export default function DatasetsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
    fetchDatasets();
  }, [router]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const data = (await DatasetService.listDatasets(0, 100)) as any[];
      setDatasets((data || []) as any);
      
      let rows = 0;
      let size = 0;
      (data || []).forEach((d: any) => {
        rows += d.row_count || 0;
        size += (d.file_size || 0) / (1024 * 1024);
      });
      setTotalRows(rows);
      setTotalSize(size);
      setError('');
    } catch (err) {
      setError('Failed to load datasets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete dataset "${name}"? This action cannot be undone.`)) return;
    
    try {
      await DatasetService.deleteDataset(id);
      setDatasets(datasets.filter(d => d.id !== id));
    } catch (err) {
      setError('Failed to delete dataset');
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
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>📊 Datasets</h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>Upload and manage your data files</p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Total Datasets</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2d8659', margin: 0 }}>{datasets.length}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Total Rows</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2d8659', margin: 0 }}>{totalRows.toLocaleString()}</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', margin: '0 0 8px 0', textTransform: 'uppercase' }}>Total Size</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2d8659', margin: 0 }}>{totalSize.toFixed(1)} MB</p>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={() => router.push('/import')}
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
          Upload New Dataset
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
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading datasets...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && datasets.length === 0 && (
          <div style={{ backgroundColor: 'white', padding: '48px 32px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <Database size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>No datasets yet</p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>Upload your first file to get started</p>
          </div>
        )}

        {/* Table */}
        {!loading && datasets.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Rows</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Columns</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Size</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Created</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset, idx) => (
                  <tr key={dataset.id} style={{ borderBottom: idx < datasets.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#2d8659', fontWeight: '600', cursor: 'pointer' }} onClick={() => router.push(`/datasets/${dataset.id}/explore`)}>
                      {dataset.name}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{dataset.file_type}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>{(dataset.rows || 0).toLocaleString()}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>{dataset.columns || 0}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151', textAlign: 'center' }}>{(dataset.size_mb || 0).toFixed(2)} MB</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{formatDate(dataset.created_at)}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => router.push(`/datasets/${dataset.id}/explore`)}
                        title="Explore"
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#2d8659',
                          cursor: 'pointer',
                          padding: '6px',
                          marginRight: '8px',
                        }}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => router.push(`/clean?datasetId=${dataset.id}`)}
                        title="Clean"
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#4CBB17',
                          cursor: 'pointer',
                          padding: '6px',
                          marginRight: '8px',
                        }}
                      >
                        <Wand2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(dataset.id, dataset.name)}
                        title="Delete"
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '6px',
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
