'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BarChart3, Trash2, Edit, Loader2, Search, X, Calendar, Clock, FileText } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { ChartService, Chart } from '@/lib/services/ChartService';
import { ChartPreview } from '@/features/reports/components/ChartPreview';

export default function ChartsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchName, setSearchName] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterHour, setFilterHour] = useState('');
  const [filterDashboard, setFilterDashboard] = useState('');
  const [filterChartType, setFilterChartType] = useState('');

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

  // Filter charts based on search and filter criteria
  const filteredCharts = useMemo(() => {
    return charts.filter((chart) => {
      // Name filter
      if (searchName && !chart.name.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      // Description filter
      if (searchDescription && !chart.description?.toLowerCase().includes(searchDescription.toLowerCase())) {
        return false;
      }

      // Date filter
      if (filterDate) {
        const chartDate = new Date(chart.created_at).toISOString().split('T')[0];
        if (chartDate !== filterDate) {
          return false;
        }
      }

      // Hour filter
      if (filterHour) {
        const chartHour = new Date(chart.created_at).getHours().toString().padStart(2, '0');
        if (chartHour !== filterHour) {
          return false;
        }
      }

      // Chart type filter
      if (filterChartType && chart.chart_type !== filterChartType) {
        return false;
      }

      // Dashboard filter
      if (filterDashboard === 'with-dashboard' && !chart.dashboard_id) {
        return false;
      }
      if (filterDashboard === 'without-dashboard' && chart.dashboard_id) {
        return false;
      }

      return true;
    });
  }, [charts, searchName, searchDescription, filterDate, filterHour, filterChartType, filterDashboard]);

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

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const clearFilters = () => {
    setSearchName('');
    setSearchDescription('');
    setFilterDate('');
    setFilterHour('');
    setFilterChartType('');
    setFilterDashboard('');
  };

  const hasActiveFilters = searchName || searchDescription || filterDate || filterHour || filterChartType || filterDashboard;

  if (isLoading) return null;

  // Get unique chart types for filter dropdown
  const chartTypes = [...new Set(charts.map(c => c.chart_type))].sort();

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
        <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>Create and manage your data visualizations ({filteredCharts.length} of {charts.length})</p>
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

        {/* Filters Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>🔍 Filters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: hasActiveFilters ? '16px' : '0' }}>
            {/* Search by Name */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Name</label>
              <input
                type="text"
                placeholder="Search by chart name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Search by Description */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Description</label>
              <input
                type="text"
                placeholder="Search by description..."
                value={searchDescription}
                onChange={(e) => setSearchDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Filter by Date */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Filter by Hour */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Hour</label>
              <select
                value={filterHour}
                onChange={(e) => setFilterHour(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Any hour</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Chart Type */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Chart Type</label>
              <select
                value={filterChartType}
                onChange={(e) => setFilterChartType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">All types</option>
                {chartTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Filter by Dashboard */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '6px' }}>Dashboard</label>
              <select
                value={filterDashboard}
                onChange={(e) => setFilterDashboard(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">All charts</option>
                <option value="with-dashboard">In a dashboard</option>
                <option value="without-dashboard">Not in a dashboard</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
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

        {/* No results for filters */}
        {!loading && charts.length > 0 && filteredCharts.length === 0 && (
          <div style={{ backgroundColor: 'white', padding: '48px 32px', borderRadius: '8px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
            <Search size={48} style={{ margin: '0 auto 16px', color: '#d1d5db' }} />
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: 0 }}>No charts match your filters</p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>Try adjusting your search criteria</p>
          </div>
        )}

        {/* Charts Grid */}
        {!loading && filteredCharts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredCharts.map((chart) => (
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
                    borderBottom: '1px solid #e5e7eb',
                    minHeight: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChartPreview 
                    config={chart.config} 
                    chartType={chart.chart_type || 'bar'}
                    height={180}
                  />
                </div>

                {/* Content */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>{chart.name}</h3>
                  
                  {chart.description && (
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                      <FileText size={12} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle' }} />
                      {chart.description.length > 50 ? `${chart.description.substring(0, 50)}...` : chart.description}
                    </p>
                  )}
                  
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 4px 0' }}>
                    Type: <span style={{ fontWeight: '600', color: '#374151' }}>{chart.chart_type}</span>
                  </p>
                  
                  <div style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {formatDate(chart.created_at)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {formatTime(chart.created_at)}
                    </span>
                  </div>

                  {chart.dashboard_id && (
                    <div style={{ fontSize: '11px', color: '#10b981', backgroundColor: '#f0fdf4', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px', textAlign: 'center' }}>
                      ✓ In Dashboard
                    </div>
                  )}

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
