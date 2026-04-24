'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Database, Trash2, Eye, Wand2, Loader2 } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { DatasetService } from '@/lib/services/DatasetService';
import { WarehouseService } from '@/lib/services/WarehouseService';

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
  const searchParams = useSearchParams();
  const warehouseId = searchParams.get('warehouseId');
  const [isLoading, setIsLoading] = useState(true);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [warehouseInfo, setWarehouseInfo] = useState<any>(null);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
    fetchDatasets();
  }, [router, warehouseId]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      if (warehouseId) {
        // Fetch warehouse tables
        const warehouse = await WarehouseService.getWarehouse(warehouseId);
        setWarehouseInfo(warehouse);
        
        // Transform warehouse tables to dataset format
        const tables = (warehouse.tables || []).map((table: any) => ({
          id: table.id,
          name: table.name,
          file_type: 'WAREHOUSE_TABLE',
          row_count: table.row_count || 0,
          column_count: table.column_count || 0,
          rows: table.row_count || 0,
          columns: table.column_count || 0,
          size_mb: (table.file_size || 0) / (1024 * 1024),
          created_at: table.created_at || new Date().toISOString(),
        }));
        
        setDatasets(tables);
        let rows = 0;
        tables.forEach((t: any) => {
          rows += t.row_count || 0;
        });
        setTotalRows(rows);
        setTotalSize(tables.reduce((sum, t) => sum + t.size_mb, 0));
      } else {
        // Fetch regular datasets
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
      }
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
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          {warehouseInfo ? '🏭 ' + warehouseInfo.name : '📊 Datasets'}
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
          {warehouseInfo 
            ? `Data warehouse with ${warehouseInfo.table_count} table(s)`
            : 'Upload and manage your data files'}
        </p>
        {warehouseInfo && (
          <button
            onClick={() => router.push('/datasets')}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ← Back to All Datasets
          </button>
        )}
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

        {/* Warehouse Relationships Section */}
        {!loading && warehouseInfo && warehouseInfo.relationships && warehouseInfo.relationships.length > 0 && (
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>🔗 Table Relationships</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0' }}>
              {warehouseInfo.relationships.length} relationship(s) detected in this warehouse
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '12px' }}>
              {warehouseInfo.relationships.map((rel: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                    {rel.from_table_name}
                    <span style={{ color: '#6b7280', fontWeight: '400' }}> ({rel.from_column})</span>
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', textAlign: 'center' }}>
                    ↓ {rel.cardinality} {rel.join_type}
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    {rel.to_table_name}
                    <span style={{ color: '#6b7280', fontWeight: '400' }}> ({rel.to_column})</span>
                  </p>
                  {rel.is_auto_detected && (
                    <p style={{ fontSize: '11px', color: '#059669', marginTop: '8px', margin: '8px 0 0 0' }}>
                      ✓ Auto-detected ({Math.round(rel.confidence_score)}% confidence)
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push(`/datasets/${datasets[0]?.id}/model?warehouseId=${warehouseId}`)}
              style={{
                marginTop: '16px',
                padding: '10px 16px',
                backgroundColor: '#2d8659',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              View Relationship Diagram in Data Modeling
            </button>
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
