'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useDatasetStore } from '@/stores/datasetStore';
import {
  useDataset,
  useDatasetPreview,
  useDatasetStats,
} from '@/hooks/queries/useDatasetQueries';
import { ExploreTable } from '../components/ExploreTable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';

interface DataRow {
  [key: string]: unknown;
}

interface ExplorePageProps {
  datasetId?: string;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({ datasetId }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const activeDataset = useDatasetStore((state) => state.activeDataset);
  const [previewLimit, setPreviewLimit] = useState(100);

  const currentDatasetId = datasetId || activeDataset?.id;

  const { data: dataset, isLoading: datasetLoading } =
    useDataset(currentDatasetId || '');
  const { data: preview, isLoading: previewLoading } = useDatasetPreview(
    currentDatasetId || '',
    previewLimit
  );
  const { data: stats } = useDatasetStats(currentDatasetId || '');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!currentDatasetId) {
      router.push('/import');
    }
  }, [currentDatasetId, router]);

  const isLoading = datasetLoading || previewLoading;

  if (!currentDatasetId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No dataset selected</p>
        <Button onClick={() => router.push('/import')} className="mt-4">
          Go to Import
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {dataset?.name || 'Explore Data'}
            </h1>
            <p className="text-gray-600 mt-2">
              Analyze and filter your data
            </p>
          </div>
          <Button
            onClick={() => router.push('/import')}
            variant="outline"
          >
            Back to Import
          </Button>
        </div>
      </div>

      {dataset && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-500">Total Rows</p>
              <p className="text-2xl font-bold text-gray-900">
                {dataset.row_count.toLocaleString()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-500">Columns</p>
              <p className="text-2xl font-bold text-gray-900">
                {dataset.column_count}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-500">File Type</p>
              <p className="text-2xl font-bold text-gray-900">
                {dataset.file_type.toUpperCase()}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-2xl font-bold text-green-600">
                {dataset.status}
              </p>
            </Card>
          </div>

          {preview && preview.length > 0 && (
            <>
              <ExploreTable
                dataset={dataset}
                data={preview as DataRow[]}
                isLoading={previewLoading}
              />

              {preview.length < dataset.row_count && (
                <div className="text-center">
                  <Button
                    onClick={() => setPreviewLimit(previewLimit + 100)}
                    variant="outline"
                  >
                    Load More ({previewLimit} / {dataset.row_count.toLocaleString()})
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Next Steps
            </h2>
            <div className="grid gap-2 md:grid-cols-2">
              <Button
                onClick={() => router.push(`/datasets/${currentDatasetId}/clean`)}
                className="justify-start"
              >
                Clean Data
              </Button>
              <Button
                onClick={() => router.push(`/charts/new?datasetId=${currentDatasetId}`)}
                className="justify-start"
              >
                Create Chart
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
