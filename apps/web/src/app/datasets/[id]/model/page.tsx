import { Suspense } from 'react';
import { ModelPage } from '@/features/model/pages/ModelPage';
import { Spinner } from '@/components/ui/Spinner';

export const metadata = {
  title: 'Data Modeling - BI Platform',
  description: 'Manage table relationships, measures, and calculated columns',
};

interface ModelRouteProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ warehouseId?: string }>;
}

export default async function Page({ params, searchParams }: ModelRouteProps) {
  const { id } = await params;
  const warehouseId = (await searchParams)?.warehouseId;
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Spinner /></div>}>
        <ModelPage datasetId={id} warehouseId={warehouseId} />
      </Suspense>
    </div>
  );
}
