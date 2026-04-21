'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Loader2, Eye } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { ShareService } from '@/lib/services/ShareService';

interface SharedDashboard {
  id: string;
  dashboard_id: string;
  dashboard_name: string;
  owner_email: string;
  can_view: boolean;
  can_edit: boolean;
  can_comment: boolean;
  created_at: string;
}

export default function SharedPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shared, setShared] = useState<SharedDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'view' | 'edit'>('all');

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
    fetchShared();
  }, [router]);

  const fetchShared = async () => {
    setLoading(true);
    try {
      const data = await ShareService.listSharedDashboards();
      setShared((data || []) as any);
      setError('');
    } catch (err) {
      setError('Failed to load shared dashboards');
      console.error(err);
    } finally {
      setLoading(false);
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

  const getFilteredData = () => {
    return shared.filter((item) => {
      if (filter === 'view') return item.can_view && !item.can_edit;
      if (filter === 'edit') return item.can_edit;
      return true;
    });
  };

  if (isLoading) return null;

  const filtered = getFilteredData();

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
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>🔗 Shared with Me</h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>Dashboards shared by other team members</p>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {(['all', 'view', 'edit'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                border: '1px solid ' + (filter === f ? '#2d8659' : '#e5e7eb'),
                backgroundColor: filter === f ? '#f0fdf4' : 'white',
                color: filter === f ? '#2d8659' : '#6b7280',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'capitalize',
                transition: 'all 0.3s',
              }}
            >
              {f === 'all' ? 'All' : f === 'view' ? 'View Only' : 'Can Edit'}
            </button>
          ))}
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
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading shared dashboards...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div style={{ backgroundColor: 'white', padding: '48px 32px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <Share2 size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>No dashboards shared</p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
              {filter === 'all' ? 'No dashboards have been shared with you yet' : 'No dashboards with this permission level'}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                    Dashboard Name
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                    Owner
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                    Permissions
                  </th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                    Shared Date
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#2d8659', fontWeight: '600' }}>
                      {item.dashboard_name}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{item.owner_email}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {item.can_view && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              backgroundColor: '#dbeafe',
                              color: '#0284c7',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            View
                          </span>
                        )}
                        {item.can_edit && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              backgroundColor: '#dcfce7',
                              color: '#16a34a',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            Edit
                          </span>
                        )}
                        {item.can_comment && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              backgroundColor: '#fef3c7',
                              color: '#b45309',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            Comment
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                      {formatDate(item.created_at)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => router.push(`/dashboards/${item.dashboard_id}`)}
                        title="View Dashboard"
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#2d8659',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          margin: '0 auto',
                        }}
                      >
                        <Eye size={16} />
                        Open
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
