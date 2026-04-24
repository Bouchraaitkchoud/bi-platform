'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const datasetId = searchParams.get('datasetId');

  useEffect(() => {
    // Redirect from /clean?datasetId=xxx to /datasets/[id]/clean
    if (datasetId) {
      router.replace(`/datasets/${datasetId}/clean`);
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
