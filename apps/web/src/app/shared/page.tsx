'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Loader2, Eye, Edit3, MessageSquare, Clock, User } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { ShareService, SharedDashboard } from '@/lib/services/ShareService';

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
      setShared(data || []);
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
      if (filter === 'view') return item.permissions.can_view && !item.permissions.can_edit;
      if (filter === 'edit') return item.permissions.can_edit;
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

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/dashboards/${item.id}`)}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}
              >
                {/* Title */}
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
                  {item.name}
                </h3>
                {item.description && (
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                    {item.description}
                  </p>
                )}

                {/* Shared by & date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} style={{ color: '#9ca3af' }} />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Shared by <strong style={{ color: '#374151' }}>{item.owner_email}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} style={{ color: '#9ca3af' }} />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{formatDate(item.shared_at)}</span>
                  </div>
                </div>

                {/* Message */}
                {item.message && (
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '12px',
                  }}>
                    <p style={{ fontSize: '13px', color: '#0369a1', margin: 0, fontStyle: 'italic' }}>
                      "{item.message}"
                    </p>
                  </div>
                )}

                {/* Permissions badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.permissions.can_view && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', backgroundColor: '#dbeafe', color: '#0284c7',
                      borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                    }}>
                      <Eye size={12} /> View
                    </span>
                  )}
                  {item.permissions.can_comment && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', backgroundColor: '#fef3c7', color: '#b45309',
                      borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                    }}>
                      <MessageSquare size={12} /> Comment
                    </span>
                  )}
                  {item.permissions.can_edit && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '4px 12px', backgroundColor: '#dcfce7', color: '#16a34a',
                      borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                    }}>
                      <Edit3 size={12} /> Edit
                    </span>
                  )}
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
