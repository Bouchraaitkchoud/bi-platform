'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReportBuilderFixed } from '@/features/reports/components/ReportBuilderFixed';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function CreateChartPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const datasetId = searchParams.get('datasetId');
  const warehouseId = searchParams.get('warehouseId');
  const tableName = searchParams.get('tableName');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if ((!datasetId || datasetId === 'undefined') && (!warehouseId || !tableName)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Dataset or Warehouse Selected</h2>
          <p className="text-gray-600 mb-4">Please select a dataset or warehouse table before creating a chart. Navigate through the workflow: Import → Explore → Clean → Model → Create Charts</p>
          <Button onClick={() => router.push('/datasets')} className="bg-blue-600 hover:bg-blue-700">
            Go to Datasets
          </Button>
        </div>
      </div>
    );
  }

  return <ReportBuilderFixed datasetId={datasetId} warehouseId={warehouseId} tableName={tableName} />;
}
