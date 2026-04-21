// Protected App Layout with Sidebar
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { SidebarNav } from '@/components/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // List of public pages that don't need authentication
  const publicPages = ['/login', '/register'];

  useEffect(() => {
    const authenticated = AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (!authenticated && !publicPages.includes(pathname)) {
      router.push('/login');
    }
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show children as-is for public pages
  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  // Show layout with sidebar for authenticated pages
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6f7' }}>
      <SidebarNav />
      <div style={{ marginLeft: '250px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
