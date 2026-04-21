'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/Dropdown';
import { useLogout } from '@/hooks/queries/useAuthQueries';

export const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();

  if (!isAuthenticated || pathname?.startsWith('/auth')) {
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push('/auth/login');
      },
    });
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-blue-600">BI Platform</div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className={`px-3 py-2 text-sm font-medium rounded ${
                isActive('/dashboard')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/import"
              className={`px-3 py-2 text-sm font-medium rounded ${
                isActive('/import')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Import
            </Link>
            <Link
              href="/explore"
              className={`px-3 py-2 text-sm font-medium rounded ${
                isActive('/explore')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Explore
            </Link>
            <Link
              href="/clean"
              className={`px-3 py-2 text-sm font-medium rounded ${
                isActive('/clean')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Clean
            </Link>
            <Link
              href="/charts"
              className={`px-3 py-2 text-sm font-medium rounded ${
                isActive('/charts')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Charts
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Dropdown
              trigger={
                <span className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer">
                  {user?.full_name || 'Account'}
                </span>
              }
              items={[
                {
                  label: 'Profile',
                  onClick: () => router.push('/profile'),
                },
                {
                  label: 'Logout',
                  onClick: handleLogout,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
