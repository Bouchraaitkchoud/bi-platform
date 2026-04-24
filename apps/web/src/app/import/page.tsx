'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, AlertCircle, CheckCircle, Loader2, Plus, X } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { DatasetService } from '@/lib/services/DatasetService';
import { WarehouseService } from '@/lib/services/WarehouseService';

export default function ImportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [datasetName, setDatasetName] = useState('');
  const [importMode, setImportMode] = useState<'single' | 'warehouse'>('single');
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseDescription, setWarehouseDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (importMode === 'single') {
        await handleFile(files[0]);
      } else {
        addFilesToWarehouse(files);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (importMode === 'single') {
        handleFile(e.target.files[0]);
      } else {
        addFilesToWarehouse(e.target.files);
      }
    }
  };

  const addFilesToWarehouse = (files: FileList) => {
    const validTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        setError(`Invalid file: ${file.name}. Supported: CSV, XLSX, XLS, JSON`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError(`File ${file.name} too large. Max 50 MB`);
        continue;
      }

      // Avoid duplicates
      if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        newFiles.push(file);
      }
    }

    setSelectedFiles([...selectedFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleWarehouseUpload = async () => {
    if (!warehouseName.trim()) {
      setError('Please enter a warehouse name');
      return;
    }

    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 15, 90));
      }, 300);

      const result = await WarehouseService.importMultipleTables(
        warehouseName,
        warehouseDescription,
        selectedFiles
      );

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(`✓ Warehouse "${warehouseName}" imported successfully with ${result.table_count} table(s)`);
      
      setTimeout(() => {
        router.push(`/datasets?warehouseId=${result.warehouse_id}`);
      }, 2000);
    } catch (err) {
      setError('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleFile = async (file: File) => {
    setError('');
    setSuccess('');
    
    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(fileExt)) {
      setError('Invalid file type. Supported: CSV, XLSX, XLS, JSON');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size: 50 MB');
      return;
    }

    setUploading(true);
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 30, 90));
      }, 300);

      const result = await DatasetService.uploadFile(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setDatasetName(result.name);
      setSuccess(`✓ File uploaded successfully: ${result.name}`);
      
      setTimeout(() => {
        router.push('/datasets');
      }, 2000);
    } catch (err) {
      setError('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6f7' }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: '#2d8659',
          color: 'white',
          padding: '32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>📥 Import Data</h1>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 16px 0' }}>Upload files (CSV, Excel, JSON) and start building datasets</p>
        
        {/* Workflow Progress */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', opacity: 0.9 }}>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.8)', color: '#2d8659', fontWeight: 'bold', borderRadius: '4px' }}>● Import</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>○ Explore</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>○ Clean</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>○ Model</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>○ Charts</span>
          <span style={{ padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '4px' }}>○ Dashboard</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '48px 32px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => {
              setImportMode('single');
              setError('');
              setSuccess('');
            }}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: importMode === 'single' ? 'white' : 'transparent',
              borderBottom: importMode === 'single' ? '3px solid #2d8659' : 'none',
              color: importMode === 'single' ? '#2d8659' : '#6b7280',
              fontWeight: importMode === 'single' ? '600' : '500',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            📁 Single File
          </button>
          <button
            onClick={() => {
              setImportMode('warehouse');
              setError('');
              setSuccess('');
            }}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: importMode === 'warehouse' ? 'white' : 'transparent',
              borderBottom: importMode === 'warehouse' ? '3px solid #2d8659' : 'none',
              color: importMode === 'warehouse' ? '#2d8659' : '#6b7280',
              fontWeight: importMode === 'warehouse' ? '600' : '500',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            🏭 Warehouse (Multiple Tables)
          </button>
        </div>

        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                marginBottom: '24px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
              <p style={{ margin: 0, color: '#dc2626', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              style={{
                padding: '12px 16px',
                marginBottom: '24px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '6px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <CheckCircle size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
              <p style={{ margin: 0, color: '#16a34a', fontSize: '14px' }}>{success}</p>
            </div>
          )}

          {/* Upload Area */}
          {importMode === 'single' ? (
            <label style={{ display: 'block', cursor: uploading ? 'not-allowed' : 'pointer' }}>
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed ' + (isDragging ? '#2d8659' : '#d1d5db'),
                  borderRadius: '8px',
                  padding: '48px 32px',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#f0fdf4' : '#fafafa',
                  transition: 'all 0.3s ease',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={48} style={{ margin: '0 auto 16px', color: '#2d8659', animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#1f2937' }}>
                      Uploading...
                    </p>
                    <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px', marginTop: '16px', overflow: 'hidden' }}>
                      <div
                        style={{
                          backgroundColor: '#2d8659',
                          height: '100%',
                          width: uploadProgress + '%',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', marginRight: 0, marginBottom: 0, marginLeft: 0 }}>
                      {uploadProgress}%
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={48} style={{ margin: '0 auto 16px', color: '#6b7280' }} />
                    <p style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#1f2937' }}>
                      Drag and drop your file here
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                      Or click to browse
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                      Supported formats: CSV, Excel (.xlsx, .xls), JSON • Max 50 MB
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileSelect}
                disabled={uploading}
                style={{ display: 'none', cursor: 'pointer' }}
              />
            </label>
          ) : (
            <>
              {/* Warehouse Form */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                  Warehouse Name *
                </label>
                <input
                  type="text"
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  placeholder="e.g., Sales Data Warehouse"
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    opacity: uploading ? 0.6 : 1,
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                  Description (optional)
                </label>
                <textarea
                  value={warehouseDescription}
                  onChange={(e) => setWarehouseDescription(e.target.value)}
                  placeholder="Describe this warehouse..."
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    minHeight: '80px',
                    resize: 'vertical',
                    opacity: uploading ? 0.6 : 1,
                  }}
                />
              </div>

              {/* File Drop Zone */}
              <label style={{ display: 'block', cursor: uploading ? 'not-allowed' : 'pointer', marginBottom: '24px' }}>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: '2px dashed ' + (isDragging ? '#2d8659' : '#d1d5db'),
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    backgroundColor: isDragging ? '#f0fdf4' : '#fafafa',
                    transition: 'all 0.3s ease',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={48} style={{ margin: '0 auto 16px', color: '#2d8659', animation: 'spin 1s linear infinite' }} />
                      <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#1f2937' }}>
                        Uploading {selectedFiles.length} file(s)...
                      </p>
                      <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px', marginTop: '16px', overflow: 'hidden' }}>
                        <div
                          style={{
                            backgroundColor: '#2d8659',
                            height: '100%',
                            width: uploadProgress + '%',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', marginRight: 0, marginBottom: 0, marginLeft: 0 }}>
                        {uploadProgress}%
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={48} style={{ margin: '0 auto 16px', color: '#6b7280' }} />
                      <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#1f2937' }}>
                        Drag and drop CSV files here
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>
                        Or click to browse
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                        Drop multiple files to create tables • Max 50 MB per file
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  style={{ display: 'none', cursor: 'pointer' }}
                />
              </label>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#15803d', fontSize: '14px' }}>
                    📋 Selected Files ({selectedFiles.length}):
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          border: '1px solid #d1d5db',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>📄</span>
                          <span style={{ fontSize: '13px', color: '#1f2937', fontWeight: '500' }}>{file.name}</span>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          disabled={uploading}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <X size={18} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleWarehouseUpload}
                disabled={uploading || selectedFiles.length === 0 || !warehouseName.trim()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: selectedFiles.length > 0 && warehouseName.trim() && !uploading ? '#2d8659' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: selectedFiles.length > 0 && warehouseName.trim() && !uploading ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                }}
              >
                {uploading ? `Uploading... ${uploadProgress}%` : `Upload ${selectedFiles.length} Table(s)`}
              </button>
            </>
          )}

          {/* Info Box */}
          <div
            style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#374151',
              lineHeight: '1.6',
            }}
          >
            {importMode === 'single' ? (
              <>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>📋 Supported File Types:</p>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li>CSV (.csv) - Comma-separated values</li>
                  <li>Excel (.xlsx, .xls) - Microsoft Excel workbooks</li>
                  <li>JSON (.json) - JavaScript Object Notation</li>
                </ul>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>🏭 Warehouse Import:</p>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  <li>Upload multiple CSV files to create a warehouse with multiple tables</li>
                  <li>Each file becomes a separate table in the warehouse</li>
                  <li>Define relationships between tables in the Data Modeling section</li>
                  <li>Maximum 50 MB per file, up to 10 files per warehouse</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
