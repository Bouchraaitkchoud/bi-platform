import { CleanPage } from '@/features/clean/pages/CleanPage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Data Cleaning - BI Platform',
  description: 'Clean and transform your dataset',
};

interface CleanRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: CleanRouteProps) {
  const { id } = await params;
  return (
    <div className="container mx-auto py-0 px-0">
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><p>Loading...</p></div>}>
        <CleanPage datasetId={id} />
      </Suspense>
    </div>
  );
}
