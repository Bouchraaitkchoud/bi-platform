'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Trash2, Undo2, Redo2, Loader2, Plus } from 'lucide-react';
import { AuthService } from '@/lib/auth';
import { CleaningService } from '@/lib/services/CleaningService';
import { DatasetService } from '@/lib/services/DatasetService';

interface Transformation {
  id: string;
  operation: string;
  parameters: Record<string, any>;
  step_order: number;
  created_at: string;
}

export default function CleanPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operationType, setOperationType] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [columnName, setColumnName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  const [dataType, setDataType] = useState('string');

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [preview, transformList] = await Promise.all([
        DatasetService.getDatasetPreview(datasetId, 1),
        CleaningService.listTransformations(datasetId),
      ]);
      if (preview && preview.data && preview.data.length > 0) {
        setColumns(Object.keys(preview.data[0]));
      }
      setTransformations(transformList || []);
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransformation = async () => {
    if (!operationType) {
      setError('Please select an operation');
      return;
    }

    try {
      switch (operationType) {
        case 'drop_nulls':
          if (selectedColumns.length === 0) {
            setError('Please select at least one column');
            return;
          }
          await CleaningService.dropNulls(datasetId, selectedColumns);
          break;
        case 'drop_duplicates':
          if (selectedColumns.length === 0) {
            setError('Please select at least one column');
            return;
          }
          await CleaningService.dropDuplicates(datasetId, selectedColumns);
          break;
        case 'rename_column':
          if (!columnName || !newColumnName) {
            setError('Please fill in all fields');
            return;
          }
          await CleaningService.renameColumn(datasetId, columnName, newColumnName);
          break;
        case 'change_type':
          if (!columnName) {
            setError('Please select a column');
            return;
          }
          await CleaningService.changeColumnType(datasetId, columnName, dataType);
          break;
        case 'remove_columns':
          if (selectedColumns.length === 0) {
            setError('Please select at least one column');
            return;
          }
          await CleaningService.removeColumns(datasetId, selectedColumns);
          break;
      }

      // Reload transformations
      const list = await CleaningService.listTransformations(datasetId);
      setTransformations(list || []);
      setOperationType('');
      setSelectedColumns([]);
      setColumnName('');
      setNewColumnName('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply transformation');
    }
  };

  const handleUndoTransformation = async (transformId: string) => {
    try {
      await CleaningService.undoTransformation(datasetId, transformId);
      const list = await CleaningService.listTransformations(datasetId);
      setTransformations(list || []);
    } catch (err) {
      setError('Failed to undo transformation');
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
          padding: '24px 32px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.back()}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>🧹 Data Cleaning</h1>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0 0' }}>Transform and clean your dataset</p>
          </div>
          <button
            onClick={() => router.push(`/datasets/${datasetId}/model`)}
            style={{
              backgroundColor: 'white',
              color: '#2d8659',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Next: Data Model
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        {/* Sidebar - Operations */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginTop: 0, marginRight: 0, marginBottom: '16px', marginLeft: 0 }}>Add Transformation</h2>

          {error && (
            <div
              style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '12px',
              }}
            >
              {error}
            </div>
          )}

          {/* Operation Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6b7280', textTransform: 'uppercase' }}>
              Operation
            </label>
            <select
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select Operation --</option>
              <option value="drop_nulls">Drop Nulls</option>
              <option value="drop_duplicates">Drop Duplicates</option>
              <option value="rename_column">Rename Column</option>
              <option value="change_type">Change Column Type</option>
              <option value="remove_columns">Remove Columns</option>
            </select>
          </div>

          {/* Operation-Specific Fields */}
          {operationType === 'drop_nulls' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                Select Columns
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {columns.map((col) => (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([...selectedColumns, col]);
                        } else {
                          setSelectedColumns(selectedColumns.filter((c) => c !== col));
                        }
                      }}
                    />
                    {col}
                  </label>
                ))}
              </div>
            </div>
          )}

          {operationType === 'drop_duplicates' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                Select Columns
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {columns.map((col) => (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([...selectedColumns, col]);
                        } else {
                          setSelectedColumns(selectedColumns.filter((c) => c !== col));
                        }
                      }}
                    />
                    {col}
                  </label>
                ))}
              </div>
            </div>
          )}

          {operationType === 'rename_column' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Column Name
                </label>
                <select
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">-- Select Column --</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  New Name
                </label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Enter new column name"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                  }}
                />
              </div>
            </>
          )}

          {operationType === 'change_type' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Column Name
                </label>
                <select
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">-- Select Column --</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                  Data Type
                </label>
                <select
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <option value="string">String</option>
                  <option value="integer">Integer</option>
                  <option value="float">Float</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
            </>
          )}

          {operationType === 'remove_columns' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
                Select Columns to Remove
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {columns.map((col) => (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns([...selectedColumns, col]);
                        } else {
                          setSelectedColumns(selectedColumns.filter((c) => c !== col));
                        }
                      }}
                    />
                    {col}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddTransformation}
            disabled={loading || !operationType}
            style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: operationType && !loading ? '#2d8659' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: operationType && !loading ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
            {loading ? 'Applying...' : 'Apply Transformation'}
          </button>
        </div>

        {/* Main Area - Transformation History */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginTop: 0, marginRight: 0, marginBottom: '16px', marginLeft: 0 }}>Transformation History</h2>

          {loading && (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <Loader2 size={32} style={{ margin: '0 auto', color: '#2d8659', animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {!loading && transformations.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>No transformations applied yet</p>
          )}

          {!loading && transformations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transformations.map((trans, idx) => (
                <div
                  key={trans.id}
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    padding: '12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0', fontSize: '14px' }}>
                      Step {idx + 1}: {trans.operation.toUpperCase()}
                    </p>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '12px' }}>
                      {JSON.stringify(trans.parameters)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUndoTransformation(trans.id)}
                    style={{
                      backgroundColor: '#fee2e2',
                      border: 'none',
                      color: '#dc2626',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Undo2 size={14} />
                    Undo
                  </button>
                </div>
              ))}
            </div>
          )}
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
