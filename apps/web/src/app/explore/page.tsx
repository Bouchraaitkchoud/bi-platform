import { ExplorePage } from '@/features/explore/pages/ExplorePage';
import { Suspense } from 'react';

export const metadata = {
  title: 'Explore Data - BI Platform',
  description: 'Analyze and explore your dataset',
};

interface ExplorePageProps {
  searchParams: {
    datasetId?: string;
  };
}

export default function Page({ searchParams }: ExplorePageProps) {
  return (
    <div className="container mx-auto py-12 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ExplorePage datasetId={searchParams.datasetId} />
      </Suspense>
    </div>
  );
}
