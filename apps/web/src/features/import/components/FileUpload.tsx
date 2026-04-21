'use client';

import { useState, useRef } from 'react';
import { useUploadDataset } from '@/hooks/queries/useDatasetQueries';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

interface FileUploadProps {
  onUploadStart?: () => void;
  onUploadComplete?: (fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadStart,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDataset();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const supportedFormats = ['csv', 'xlsx', 'xls', 'json'];

  const handleFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !supportedFormats.includes(extension)) {
      uploadMutation.error = new Error(
        `Unsupported file format. Please upload: ${supportedFormats.join(', ')}`
      );
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      uploadMutation.error = new Error('File size exceeds 100MB limit');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    onUploadStart?.();
    uploadMutation.mutate(selectedFile, {
      onSuccess: () => {
        onUploadComplete?.(selectedFile.name);
        setSelectedFile(null);
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          accept={`.${supportedFormats.join(',.')}`}
          className="hidden"
        />

        <div className="p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-12-8v12m0 0l-4-4m4 4l4-4"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-4 text-lg font-semibold text-gray-900">
            {selectedFile ? selectedFile.name : 'Drop file here or click to select'}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Supports: {supportedFormats.join(', ').toUpperCase()} (max 100MB)
          </p>

          {!selectedFile && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4"
              variant="outline"
            >
              Select File
            </Button>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </span>
              <span className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            {uploadMutation.isPending && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>

          {uploadMutation.error && (
            <Alert
              type="error"
              message={
                uploadMutation.error instanceof Error
                  ? uploadMutation.error.message
                  : 'Upload failed'
              }
              onClose={() => {
                uploadMutation.reset();
                setSelectedFile(null);
              }}
            />
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="flex-1"
            >
              {uploadMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
            <Button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={uploadMutation.isPending}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
