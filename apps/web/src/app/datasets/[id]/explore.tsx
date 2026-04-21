'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Download, Loader2, BarChart3 } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { DatasetService, type DatasetPreview } from '@/lib/services/DatasetService';

interface Statistics {
  [key: string]: {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    std_dev?: number;
  };
}

export default function DatasetExplorePage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [previewData, stats] = await Promise.all([
        DatasetService.getDatasetPreview(datasetId, pageSize),
        DatasetService.getColumnStatistics(datasetId, ['*']),
      ]);
      setPreview(previewData as any);
      setStatistics((stats || {}) as any);
      setError('');
    } catch (err) {
      setError('Failed to load dataset preview');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await DatasetService.exportDatasetAsCSV(datasetId);
      // Trigger download (backend should return blob)
    } catch (err) {
      setError('Failed to export dataset');
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  if (isLoading) return null;

  const columns = preview?.columns || [];
  const data = preview?.data || [];
  const totalRows = preview?.row_count || 0;
  const totalPages = Math.ceil(totalRows / pageSize);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
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
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>📊 Data Explorer</h1>
          </div>
          <button
            onClick={() => router.push(`/datasets/${datasetId}/clean`)}
            style={{
              backgroundColor: 'white',
              color: '#2d8659',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Next: Clean Data
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', fontSize: '13px' }}>
          <div>
            <p style={{ margin: 0, opacity: 0.8 }}>Total Rows</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{totalRows.toLocaleString()}</p>
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.8 }}>Columns</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0 0 0' }}>{columns.length}</p>
          </div>
          <div>
            <p style={{ margin: 0, opacity: 0.8 }}>Current Page</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
              {currentPage} / {totalPages}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={200}>200 rows</option>
            <option value={500}>500 rows</option>
          </select>

          <button
            onClick={handleExport}
            style={{
              backgroundColor: '#2d8659',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

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
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading data...</p>
          </div>
        )}

        {/* Data Table */}
        {!loading && data.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#374151',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: sortColumn === col ? '#f0fdf4' : undefined,
                        }}
                      >
                        {col} {sortColumn === col && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      {columns.map((col) => (
                        <td
                          key={`${idx}-${col}`}
                          style={{
                            padding: '12px',
                            fontSize: '13px',
                            color: '#374151',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={String(row[col])}
                        >
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div style={{ backgroundColor: 'white', padding: '48px 32px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <BarChart3 size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>No data available</p>
          </div>
        )}

        {/* Statistics Panel */}
        {Object.keys(statistics).length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>Column Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {Object.entries(statistics).map(([col, stats]: [string, any]) => (
                <div key={col} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginTop: 0, marginRight: 0, marginBottom: '12px', marginLeft: 0 }}>
                    {col}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                    {(stats as any)?.min !== undefined && (
                      <div>
                        <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>Min</p>
                        <p style={{ fontWeight: '600', color: '#374151', margin: 0 }}>{(stats as any)?.min}</p>
                      </div>
                    )}
                    {(stats as any)?.max !== undefined && (
                      <div>
                        <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>Max</p>
                        <p style={{ fontWeight: '600', color: '#374151', margin: 0 }}>{(stats as any)?.max}</p>
                      </div>
                    )}
                    {(stats as any)?.mean !== undefined && (
                      <div>
                        <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>Mean</p>
                        <p style={{ fontWeight: '600', color: '#374151', margin: 0 }}>{((stats as any)?.mean).toFixed(2)}</p>
                      </div>
                    )}
                    {(stats as any)?.median !== undefined && (
                      <div>
                        <p style={{ color: '#6b7280', margin: '0 0 4px 0' }}>Median</p>
                        <p style={{ fontWeight: '600', color: '#374151', margin: 0 }}>{((stats as any)?.median).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid ' + (currentPage === page ? '#2d8659' : '#d1d5db'),
                  backgroundColor: currentPage === page ? '#2d8659' : 'white',
                  color: currentPage === page ? 'white' : '#374151',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {page}
              </button>
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
