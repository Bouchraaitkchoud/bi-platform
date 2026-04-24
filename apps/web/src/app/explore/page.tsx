'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetId = searchParams.get('datasetId');

  useEffect(() => {
    // Redirect from /explore?datasetId=xxx to /datasets/[id]/explore
    if (datasetId) {
      router.replace(`/datasets/${datasetId}/explore`);
    } else {
      // If no datasetId, go to import page
      router.replace('/import');
    }
  }, [datasetId, router]);

  return (
    <div className="container mx-auto py-0 px-0">
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
