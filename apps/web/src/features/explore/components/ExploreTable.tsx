'use client';

import { useEffect, useState } from 'react';
import { Dataset } from '@/stores/datasetStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface DataRow {
  [key: string]: unknown;
}

interface ExploreTableProps {
  dataset: Dataset;
  data: DataRow[];
  isLoading?: boolean;
  onExport?: (format: 'csv' | 'json') => void;
}

export const ExploreTable: React.FC<ExploreTableProps> = ({
  dataset,
  data,
  isLoading,
  onExport,
}) => {
  const [filteredData, setFilteredData] = useState<DataRow[]>(data);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let result = [...data];

    // Apply search term
    if (searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        result = result.filter((row) =>
          String(row[column])
            .toLowerCase()
            .includes(filterValue.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return sortConfig.direction === 'asc'
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      });
    }

    setFilteredData(result);
  }, [data, sortConfig, filters, searchTerm]);

  const columns = dataset.columns_metadata.map((col) => col.name);

  const handleSort = (column: string) => {
    setSortConfig((prev) =>
      prev?.key === column && prev?.direction === 'asc'
        ? { key: column, direction: 'desc' }
        : { key: column, direction: 'asc' }
    );
  };

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const handleExportCSV = () => {
    const headers = columns.join(',');
    const rows = filteredData
      .map((row) =>
        columns
          .map((col) => {
            const val = row[col];
            if (typeof val === 'string' && val.includes(',')) {
              return `"${val}"`;
            }
            return val;
          })
          .join(',')
      )
      .join('\n');

    const csv = `${headers}\n${rows}`;
    downloadFile(csv, `${dataset.name}_export.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(filteredData, null, 2);
    downloadFile(json, `${dataset.name}_export.json`, 'application/json');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search all columns
            </label>
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Filters
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {columns.map((col) => (
                <Input
                  key={col}
                  type="text"
                  placeholder={`Filter ${col}`}
                  value={filters[col] || ''}
                  onChange={(e) =>
                    handleFilterChange(col, e.target.value)
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExportCSV}
              disabled={isLoading}
              variant="outline"
            >
              Export CSV
            </Button>
            <Button
              onClick={handleExportJSON}
              disabled={isLoading}
              variant="outline"
            >
              Export JSON
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(col)}
                  >
                    <div className="flex items-center gap-2">
                      {col}
                      {sortConfig?.key === col && (
                        <span>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    Loading data...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={`${idx}-${col}`}
                        className="px-4 py-3 text-gray-700 max-w-xs truncate"
                        title={String(row[col])}
                      >
                        {row[col] === null || row[col] === undefined
                          ? 'NULL'
                          : String(row[col]).substring(0, 100)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No data to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="text-sm text-gray-600">
        Showing {filteredData.length} of {data.length} rows
      </div>
    </div>
  );
};
