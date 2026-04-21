'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DatasetService, DatasetPreview, ColumnStatistics } from '@/lib/services/DatasetService';
import { AuthService } from '@/lib/auth';

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f6f7', display: 'flex', flexDirection: 'column' as const },
  header: { backgroundColor: '#2d8659', color: 'white', padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  content: { padding: '32px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%' },
  controls: { display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' as const },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' as const, backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' },
  tableHeader: { backgroundColor: '#f9fafb', padding: '12px', textAlign: 'left' as const, fontWeight: '600', borderBottom: '1px solid #e5e7eb', fontSize: '13px' },
  tableCell: { padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' },
};

export default function ExploreDataPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params.id as string;
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [statistics, setStatistics] = useState<ColumnStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const rowsPerPage = 100;

  useEffect(() => {
    if (!AuthService.isAuthenticated()) router.push('/login');
    else fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [previewData, statsData] = await Promise.all([
        DatasetService.getDatasetPreview(datasetId, 1000),
        DatasetService.getColumnStatistics(datasetId),
      ]);
      setPreview(previewData);
      setStatistics(statsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.container}><div style={styles.header}><h1>Loading...</h1></div></div>;
  if (!preview) return <div style={styles.container}><div style={styles.header}><h1>Failed to load data</h1></div></div>;

  const displayData = preview.data.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>🔍 Explore Data</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>Rows: {preview.row_count} | Columns: {preview.column_count}</p>
      </div>
      <div style={styles.content}>
        <div style={styles.controls}>
          <select style={styles.select} onChange={(e) => setSortColumn(e.target.value)}>
            <option value="">Sort by column...</option>
            {preview.columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
          <select style={styles.select} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <button style={{ padding: '8px 16px', backgroundColor: '#2d8659', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            📥 Export CSV
          </button>
          <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: 'auto' }}>
            Page {page + 1} of {Math.ceil(preview.data.length / rowsPerPage)}
          </span>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              {preview.columns.map(col => (
                <th key={col} style={styles.tableHeader}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, idx) => (
              <tr key={idx}>
                {preview.columns.map(col => (
                  <td key={`${idx}-${col}`} style={styles.tableCell}>{String(row[col] || '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          {Array.from({ length: Math.ceil(preview.data.length / rowsPerPage) }).map((_, i) => (
            <button
              key={i}
              style={{
                padding: '8px 12px',
                backgroundColor: i === page ? '#2d8659' : '#f3f4f6',
                color: i === page ? 'white' : '#1f2937',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
