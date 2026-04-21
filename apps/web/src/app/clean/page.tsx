'use client';

import { CleanPage } from '@/features/clean/pages/CleanPage';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const datasetId = searchParams.get('datasetId') || undefined;

  return (
    <div className="container mx-auto py-0 px-0">
      <CleanPage datasetId={datasetId} />
    </div>
  );
}
