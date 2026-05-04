'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { useDatasets } from '@/hooks/queries/useDatasetQueries';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user: authUser } = useAuthStore();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: datasets, isLoading: datasetsLoading } = useDatasets();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (userLoading || datasetsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const currentUser = user || authUser;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, {currentUser?.full_name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Let's analyze your data and create insights
            </p>
          </div>
          <Link href="/profile">
            <Button variant="outline">My Profile</Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/datasets/new">
              <div className="text-center">
                <div className="text-4xl mb-2">📤</div>
                <h3 className="font-semibold text-gray-900">Import Data</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Upload files or connect to a database
                </p>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/explore">
              <div className="text-center">
                <div className="text-4xl mb-2">🔍</div>
                <h3 className="font-semibold text-gray-900">Explore Data</h3>
                <p className="text-sm text-gray-500 mt-2">
                  View and filter your datasets
                </p>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/clean">
              <div className="text-center">
                <div className="text-4xl mb-2">✨</div>
                <h3 className="font-semibold text-gray-900">Clean Data</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Transform and prepare your data
                </p>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/charts">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900">Create Charts</h3>
                <p className="text-sm text-gray-500 mt-2">
                  Visualize your data insights
                </p>
              </div>
            </Link>
          </Card>
        </div>

        {/* Recent Datasets */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Recent Datasets
          </h2>

          {datasets && datasets.length > 0 ? (
            <div className="grid gap-4">
              {datasets.slice(0, 5).map((dataset) => (
                <Card key={dataset.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {dataset.name}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {dataset.row_count.toLocaleString()} rows ·{' '}
                        {dataset.column_count} columns ·{' '}
                        {(dataset.file_type ?? dataset.source_type ?? 'DATABASE').toString().toUpperCase()} ·{' '}
                        {new Date(dataset.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/explore?datasetId=${dataset.id}`}>
                        <Button variant="outline">Explore</Button>
                      </Link>
                      <Link href={`/clean?datasetId=${dataset.id}`}>
                        <Button variant="outline">Clean</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-500 mb-4">No datasets yet</p>
              <Link href="/import">
                <Button>Import Your First Dataset</Button>
              </Link>
            </Card>
          )}

          {datasets && datasets.length > 5 && (
            <div className="text-center mt-4">
              <Link href="/import">
                <Button variant="outline">View All Datasets</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
