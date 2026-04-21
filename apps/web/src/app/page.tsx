'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { AuthService } from '@/lib/auth';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f6f7',
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
  },
  sidebar: {
    width: '250px',
    backgroundColor: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '20px 0',
    position: 'fixed' as const,
    height: '100vh',
    overflowY: 'auto' as const,
  },
  main: {
    marginLeft: '250px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0,
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '12px 20px',
    margin: '12px 0 0 0',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  navItem: {
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  navItemActive: {
    backgroundColor: '#f0fdf4',
    color: '#2d8659',
    borderLeft: '4px solid #2d8659',
    paddingLeft: '16px',
  },
  content: {
    flex: 1,
    padding: '40px',
  },
  heroSection: {
    textAlign: 'center' as const,
    marginBottom: '60px',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 16px 0',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#6b7280',
    margin: '0 0 32px 0',
    lineHeight: '1.6',
  },
  button: {
    padding: '12px 32px',
    backgroundColor: '#2d8659',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginTop: '40px',
  },
  card: {
    backgroundColor: 'white',
    padding: '32px 24px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
  },
  cardIcon: {
    fontSize: '32px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 12px 0',
  },
  cardDesc: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.6',
  },
  userSection: {
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb',
    marginTop: 'auto',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2d8659',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
  },
  userEmail: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
  },
};

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth status - allow unauthenticated users on landing page
    const token = AuthService.getToken();
    if (!token) {
      // Not authenticated, show landing page
    }
  }, [router]);

  const user = AuthService.getUser();

  const navItems = [
    { label: 'Dashboards', icon: '📊', path: '/dashboards' },
    { label: 'Chart Builder', icon: '📈', path: '/charts' },
    { label: 'Datasets', icon: '📁', path: '/datasets' },
    { label: 'Import Data', icon: '📥', path: '/import' },
    { label: 'Clean & Transform', icon: '🔧', path: '/transform' },
    { label: 'Shared with Me', icon: '🔗', path: '/shared' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0', color: '#2d8659' }}>📊 DataFlow</h1>
        </div>

        {/* Navigation Sections */}
        <div>
          <h3 style={styles.sectionTitle}>Workspace</h3>
          {navItems.slice(0, 2).map((item) => (
            <div
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                ...styles.navItem,
                ...(pathname === item.path ? styles.navItemActive : {}),
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}

          <h3 style={styles.sectionTitle}>Data</h3>
          {navItems.slice(2, 5).map((item) => (
            <div
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                ...styles.navItem,
                ...(pathname === item.path ? styles.navItemActive : {}),
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}

          <h3 style={styles.sectionTitle}>System</h3>
          {navItems.slice(5).map((item) => (
            <div
              key={item.path}
              onClick={() => router.push(item.path)}
              style={{
                ...styles.navItem,
                ...(pathname === item.path ? styles.navItemActive : {}),
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}

          <div style={{ padding: '12px 20px', marginTop: '8px' }}>
            <div
              onClick={() => router.push('/help')}
              style={{
                ...styles.navItem,
                padding: '8px 12px',
                fontSize: '14px',
              }}
            >
              <span>❓</span>
              <span>Help</span>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div style={styles.userSection}>
          <div style={styles.userProfile}>
            <div style={styles.avatar}>{user?.email?.charAt(0).toUpperCase() || 'B'}</div>
            <div>
              <p style={styles.userName}>{user?.email?.split('@')[0] || 'Bouchra'}</p>
              <p style={styles.userEmail}>{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <p style={styles.headerTitle}>Home / Dashboards</p>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search dashboards, datasets..."
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                width: '300px',
              }}
            />
            <span style={{ fontSize: '24px', cursor: 'pointer' }}>🔔</span>
            <button
              onClick={() => {
                AuthService.logout();
                router.push('/login');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#2d8659',
                border: '1px solid #2d8659',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0fdf4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Login
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <h1 style={styles.heroTitle}>📊 BI Platform</h1>
          <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

          <div style={styles.heroSection}>
            <h2 style={styles.heroTitle}>Self-Service Business Intelligence</h2>
            <p style={styles.heroSubtitle}>
              Upload your data, create beautiful visualizations, and share interactive dashboards with your team.
            </p>
            <button
              style={styles.button}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1f5c3d';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 134, 89, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2d8659';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => router.push('/dashboards')}
            >
              Sign In
            </button>
          </div>

          {/* Features Grid */}
          <div style={styles.cardsGrid}>
            <div
              style={{
                ...styles.card,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.cardIcon}>📥</div>
              <h3 style={styles.cardTitle}>Upload Data</h3>
              <p style={styles.cardDesc}>Import CSV, Excel, or JSON files easily. We handle the parsing for you.</p>
            </div>

            <div
              style={{
                ...styles.card,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.cardIcon}>📈</div>
              <h3 style={styles.cardTitle}>Create Charts</h3>
              <p style={styles.cardDesc}>Build interactive visualizations with just a few clicks.</p>
            </div>

            <div
              style={{
                ...styles.card,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.cardIcon}>🔗</div>
              <h3 style={styles.cardTitle}>Share & Collaborate</h3>
              <p style={styles.cardDesc}>Share dashboards with your team and manage permissions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
