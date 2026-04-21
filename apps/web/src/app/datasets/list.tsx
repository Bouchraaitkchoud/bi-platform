'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DatasetService, Dataset } from '@/lib/services/DatasetService';
import { AuthService } from '@/lib/auth';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f6f7',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: '#2d8659',
    color: 'white',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  headerSubtitle: {
    fontSize: '16px',
    opacity: 0.9,
    margin: 0,
  },
  content: {
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
    flex: 1,
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#2d8659',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px',
    transition: 'all 0.3s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 8px 0',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2d8659',
    margin: 0,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    textAlign: 'left' as const,
    fontWeight: '600',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#1f2937',
  },
  tableCell: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#1f2937',
  },
  tableRow: {
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '48px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'center' as const,
  },
  emptyStateText: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 20px 0',
  },
  actionButton: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    marginRight: '8px',
  },
};

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const data = await DatasetService.listDatasets(0, 20);
      setDatasets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch datasets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return;

    try {
      await DatasetService.deleteDataset(datasetId);
      setDatasets(datasets.filter(d => d.id !== datasetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dataset');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>📊 Datasets</h1>
        <p style={styles.headerSubtitle}>Manage your data datasets</p>
      </div>

      <div style={styles.content}>
        <button
          onClick={() => router.push('/import')}
          style={styles.buttonPrimary}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1f5c3d';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2d8659';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ➕ Import New Dataset
        </button>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Datasets</p>
            <p style={styles.statValue}>{datasets.length}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Rows</p>
            <p style={styles.statValue}>
              {datasets.reduce((sum, d) => sum + d.row_count, 0).toLocaleString()}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Size</p>
            <p style={styles.statValue}>
              {(
                datasets.reduce((sum, d) => sum + d.file_size, 0) /
                1024 /
                1024
              ).toFixed(1)}{' '}
              MB
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              borderRadius: '6px',
              border: '1px solid #fee2e2',
              color: '#991b1b',
              marginBottom: '24px',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              backgroundColor: 'white',
              padding: '48px',
              borderRadius: '8px',
              textAlign: 'center' as const,
            }}
          >
            <p>⏳ Loading datasets...</p>
          </div>
        ) : datasets.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateText}>No datasets yet</p>
            <button
              onClick={() => router.push('/import')}
              style={styles.buttonPrimary}
            >
              Import Your First Dataset
            </button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Type</th>
                <th style={styles.tableHeader}>Rows</th>
                <th style={styles.tableHeader}>Columns</th>
                <th style={styles.tableHeader}>Size</th>
                <th style={styles.tableHeader}>Created</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset) => (
                <tr
                  key={dataset.id}
                  style={styles.tableRow}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td
                    style={{ ...styles.tableCell, cursor: 'pointer', fontWeight: '600' }}
                    onClick={() => router.push(`/datasets/${dataset.id}`)}
                  >
                    {dataset.name}
                  </td>
                  <td style={styles.tableCell}>{dataset.file_type}</td>
                  <td style={styles.tableCell}>{dataset.row_count.toLocaleString()}</td>
                  <td style={styles.tableCell}>{dataset.column_count}</td>
                  <td style={styles.tableCell}>
                    {(dataset.file_size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td style={styles.tableCell}>
                    {new Date(dataset.created_at).toLocaleDateString()}
                  </td>
                  <td style={styles.tableCell}>
                    <button
                      style={styles.actionButton}
                      onClick={() => router.push(`/datasets/${dataset.id}`)}
                    >
                      Explore
                    </button>
                    <button
                      style={styles.actionButton}
                      onClick={() => router.push(`/datasets/${dataset.id}/clean`)}
                    >
                      Clean
                    </button>
                    <button
                      style={{ ...styles.actionButton, backgroundColor: '#fee2e2', color: '#991b1b' }}
                      onClick={() => handleDeleteDataset(dataset.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
