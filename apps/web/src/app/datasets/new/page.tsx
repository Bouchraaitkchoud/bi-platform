// apps/web/src/app/datasets/new/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Tabs, TabConfig } from '@/components/ui/Tabs';
import { Database, FileUp } from 'lucide-react';
import DatabaseConnectionForm from '@/features/datasets/components/DatabaseConnectionForm';

const NewDatasetPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('file');

  const handleSuccess = (dataset: any) => {
    router.push(`/datasets/${dataset.id}/explore`);
  };

  const tabs: TabConfig[] = [
    {
      id: 'file',
      label: 'From File',
      content: (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Import data from CSV, Excel, or JSON files
          </p>
          <a href="/import" className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Go to File Upload
          </a>
        </div>
      ),
    },
    {
      id: 'database',
      label: 'From Database',
      content: <DatabaseConnectionForm onSuccess={handleSuccess} />,
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">Import Data</h1>
          <p className="text-gray-600 mb-6">
            Choose your data source: upload files or connect to a database
          </p>
          <Tabs 
            tabs={tabs}
            defaultActive="file"
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </Card>
    </div>
  );
};

export default NewDatasetPage;
