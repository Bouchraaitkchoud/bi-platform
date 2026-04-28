// Sidebar Navigation Component
'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  BarChart3,
  Upload,
  Eye,
  Wand2,
  Grid3X3,
  LineChart,
  Share2,
  LogOut,
  ChevronDown,
  Zap,
  KeyIcon,
} from 'lucide-react';
import { AuthService } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  title?: string;
}

export const SidebarNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = AuthService.getUser();
  const warehouseId = searchParams.get('warehouseId');
  const datasetId = searchParams.get('datasetId');

  // Determine the current context (warehouse or dataset)
  const currentId = warehouseId || datasetId;
  const isWarehouse = !!warehouseId;

  // Build navigation items dynamically based on context
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { label: 'Dashboard', href: '/dashboard', icon: <BarChart3 size={20} /> },
      { label: 'Import Data', href: '/datasets/new', icon: <Upload size={20} /> },
      { label: 'Data Info', href: '/data-info', icon: <Eye size={20} /> },
    ];

    // Data operations - conditionally enabled based on warehouse/dataset selection
    let cleaningHref = '/import';
    let modelingHref = '/import';
    let chartsHref = '/charts';
    let cleaningTitle = 'Select a dataset to clean';
    let modelingTitle = 'Select a dataset to model';
    let chartsTitle = 'Select a dataset to create charts';

    if (currentId) {
      if (isWarehouse) {
        cleaningHref = `/datasets/${warehouseId}/clean?warehouseId=${warehouseId}`;
        modelingHref = `/datasets/${warehouseId}/model?warehouseId=${warehouseId}`;
        chartsHref = `/charts/new?warehouseId=${warehouseId}`;
        cleaningTitle = 'Clean warehouse tables';
        modelingTitle = 'Model warehouse relationships';
        chartsTitle = 'Create charts from warehouse';
      } else {
        cleaningHref = `/datasets/${datasetId}/clean`;
        modelingHref = `/datasets/${datasetId}/model`;
        chartsHref = `/charts/new?datasetId=${datasetId}`;
        cleaningTitle = 'Clean this dataset';
        modelingTitle = 'Model this dataset';
        chartsTitle = 'Create charts from this dataset';
      }
    }

    return [
      ...baseItems,
      { label: 'Data Cleaning', href: cleaningHref, icon: <Wand2 size={20} />, title: cleaningTitle },
      { label: 'Data Modeling', href: modelingHref, icon: <Zap size={20} />, title: modelingTitle },
      { label: 'Chart Builder', href: chartsHref, icon: <LineChart size={20} />, title: chartsTitle },
      { label: 'Dashboards', href: '/dashboards', icon: <Grid3X3 size={20} /> },
      { label: 'Shared With Me', href: '/shared', icon: <Share2 size={20} /> },
    ];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div
      style={{
        width: '250px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '16px 20px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#2d8659' }}>
          📊 DataFlow
        </h2>
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, overflow: 'auto' }}>
        {navItems.map((item, index) => (
          <button
            key={`nav-item-${index}`}
            title={item.title || item.label}
            onClick={() => router.push(item.href)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              border: 'none',
              backgroundColor: isActive(item.href) ? '#f0f9ff' : 'transparent',
              color: isActive(item.href) ? '#2d8659' : '#6b7280',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: isActive(item.href) ? '600' : '500',
              transition: 'all 0.2s ease',
              borderLeft: isActive(item.href) ? '3px solid #2d8659' : '3px solid transparent',
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.href)) {
                (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.href)) {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ color: 'inherit' }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  marginLeft: 'auto',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px 12px' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#2d8659',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'User'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </p>
            </div>
            <ChevronDown size={16} />
          </button>

          {isProfileOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1001,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
