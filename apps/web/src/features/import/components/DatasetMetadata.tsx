'use client';

import { Dataset, Column } from '@/stores/datasetStore';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/card';

interface DatasetMetadataProps {
  dataset: Dataset;
}

export const DatasetMetadata: React.FC<DatasetMetadataProps> = ({ dataset }) => {
  const statusColors: Record<string, string> = {
    UPLOADED: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    READY: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {dataset.name}
          </h3>
          <Badge className={statusColors[dataset.status]}>
            {dataset.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">File Type</p>
            <p className="text-lg font-semibold text-gray-900">
              {dataset.file_type.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rows</p>
            <p className="text-lg font-semibold text-gray-900">
              {dataset.row_count.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Columns</p>
            <p className="text-lg font-semibold text-gray-900">
              {dataset.column_count}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Uploaded</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(dataset.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {dataset.columns_metadata && dataset.columns_metadata.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Columns ({dataset.column_count})
            </h4>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {dataset.columns_metadata.map((col: Column, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{col.name}</p>
                      <p className="text-xs text-gray-500">{col.type}</p>
                    </div>
                    <Badge variant="outline">
                      {col.nullable ? 'Nullable' : 'Not Null'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
