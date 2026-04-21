'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useDatasetStore, Dataset } from '@/stores/datasetStore';
import { useDatasets } from '@/hooks/queries/useDatasetQueries';
import { FileUpload } from '../components/FileUpload';
import { DatasetMetadata } from '../components/DatasetMetadata';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/Tabs';

export const ImportFeature: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const setDatasets = useDatasetStore((state) => state.setDatasets);
  const setActiveDataset = useDatasetStore((state) => state.setActiveDataset);
  const { data: datasets, isLoading, refetch } = useDatasets();
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (datasets) {
      setDatasets(datasets);
    }
  }, [datasets, setDatasets]);

  const handleUploadComplete = (fileName: string) => {
    setActiveTab('history');
    // Refetch datasets to show the new one
    refetch();
  };

  const handleSelectDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setActiveDataset(dataset);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import Data</h1>
        <p className="text-gray-600 mt-2">
          Upload CSV, Excel, or JSON files to start analyzing
        </p>
      </div>

      <Tabs
        tabs={[
          {
            id: 'upload',
            label: 'Upload New',
            content: (
              <div>
                <FileUpload onUploadComplete={handleUploadComplete} />
              </div>
            ),
          },
          {
            id: 'history',
            label: `Your Datasets (${datasets?.length || 0})`,
            content: (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading datasets...</p>
                  </div>
                ) : datasets && datasets.length > 0 ? (
                  <div className="grid gap-4">
                    {datasets.map((dataset) => (
                      <Card
                        key={dataset.id}
                        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSelectDataset(dataset)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {dataset.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {dataset.row_count.toLocaleString()} rows ·{' '}
                              {dataset.column_count} columns
                            </p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDataset(dataset);
                              router.push('/explore');
                            }}
                          >
                            Explore
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No datasets yet</p>
                  </div>
                )}
              </div>
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {selectedDataset && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Dataset Details
          </h2>
          <DatasetMetadata dataset={selectedDataset} />
        </div>
      )}
    </div>
  );
};
