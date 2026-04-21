'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Eye,
  Wand2,
  Zap,
  LineChart,
  Grid3X3,
  Share2,
  ArrowRight,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { datasetsApi, dashboardsApi } from '@/lib/api-client';

export default function DashboardsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [datasetsList, dashboardsList] = await Promise.all([
        datasetsApi.listDatasets(),
        dashboardsApi.listDashboards(),
      ]);
      setDatasets((Array.isArray(datasetsList) ? datasetsList : []) as any[]);
      setDashboards((Array.isArray(dashboardsList) ? dashboardsList : []) as any[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const workflowSteps = [
    {
      step: 1,
      title: 'Import Data',
      description: 'Upload CSV, Excel, or JSON files',
      href: '/import',
      icon: <Upload size={28} />,
    },
    {
      step: 2,
      title: 'View Data Info',
      description: 'Explore columns, types, and statistics',
      href: '/data-info',
      icon: <Eye size={28} />,
    },
    {
      step: 3,
      title: 'Clean Data',
      description: 'Remove nulls, duplicates, and format',
      href: '/data-cleaning',
      icon: <Wand2 size={28} />,
    },
    {
      step: 4,
      title: 'Model Data',
      description: 'Create measures and calculated columns',
      href: '/data-modeling',
      icon: <Zap size={28} />,
    },
    {
      step: 5,
      title: 'Create Charts',
      description: 'Build visualizations and insights',
      href: '/charts/new',
      icon: <LineChart size={28} />,
    },
    {
      step: 6,
      title: 'Build Dashboard',
      description: 'Combine charts into dashboards',
      href: '/dashboards/new',
      icon: <Grid3X3 size={28} />,
    },
    {
      step: 7,
      title: 'Share Dashboard',
      description: 'Share insights with your team',
      href: '/shared',
      icon: <Share2 size={28} />,
    },
  ];

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '24px 32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
          Welcome to DataFlow BI
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          Transform your data into actionable insights
        </p>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '32px' }}>
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
            {[
              { label: 'Datasets', value: datasets.length, icon: '📊' },
              { label: 'Total Rows', value: datasets.reduce((sum, d) => sum + (d.row_count || 0), 0).toLocaleString(), icon: '📈' },
              { label: 'Dashboards', value: dashboards.length, icon: '📋' },
            ].map((stat) => (
              <div key={stat.label} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>{stat.label}</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Data Analysis Workflow */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              Data Analysis Workflow
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
              Follow these steps to analyze and visualize your data:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {workflowSteps.map((step) => (
                <button
                  key={step.step}
                  onClick={() => router.push(step.href)}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    (e.currentTarget).style.transform = 'translateY(-4px)';
                    (e.currentTarget).style.borderColor = '#2d8659';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget).style.boxShadow = 'none';
                    (e.currentTarget).style.transform = 'translateY(0)';
                    (e.currentTarget).style.borderColor = '#e5e7eb';
                  }}
                >
                  {/* Step badge */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f0f9ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#2d8659',
                  }}>
                    {step.step}
                  </div>

                  {/* Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginRight: '30px' }}>
                    <div style={{ fontSize: '24px' }}>{step.icon}</div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                        {step.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ position: 'absolute', bottom: '16px', right: '16px', color: '#d1d5db' }}>
                    <ArrowRight size={20} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Dashboards */}
          {dashboards.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  My Dashboards
                </h2>
                <button
                  onClick={() => router.push('/dashboards/new')}
                  style={{
                    backgroundColor: '#2d8659',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Plus size={16} />
                  New Dashboard
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '16px',
                }}
              >
                {dashboards.map((dashboard) => (
                  <div
                    key={dashboard.id}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      (e.currentTarget).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget).style.boxShadow = 'none';
                      (e.currentTarget).style.transform = 'translateY(0)';
                    }}
                  >
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                      {dashboard.name}
                    </h3>
                    {dashboard.description && (
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 12px 0' }}>
                        {dashboard.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboards/${dashboard.id}`);
                        }}
                        style={{
                          flex: 1,
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#374151',
                          fontWeight: '500',
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
            }}>
              <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
              <p style={{ color: '#991b1b', margin: 0, fontSize: '14px' }}>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
