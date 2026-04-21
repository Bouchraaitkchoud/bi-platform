'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/Select';

interface TransformationStep {
  id: string;
  operation: string;
  parameters: Record<string, unknown>;
  description?: string;
}

interface TransformationPipelineProps {
  steps: TransformationStep[];
  onAddStep: (operation: string, parameters: Record<string, unknown>) => void;
  onRemoveStep: (stepId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isApplying?: boolean;
}

const OPERATIONS = [
  {
    id: 'DROP_NULLS',
    name: 'Drop Null Values',
    description: 'Remove rows with null values in specified columns',
  },
  {
    id: 'DROP_DUPLICATES',
    name: 'Drop Duplicates',
    description: 'Remove duplicate rows based on selected columns',
  },
  {
    id: 'RENAME_COLUMN',
    name: 'Rename Column',
    description: 'Rename a column',
  },
  {
    id: 'CAST_TYPE',
    name: 'Cast Data Type',
    description: 'Convert column to a different data type',
  },
  {
    id: 'FILTER_ROWS',
    name: 'Filter Rows',
    description: 'Filter rows based on conditions',
  },
  {
    id: 'DROP_COLUMN',
    name: 'Drop Column',
    description: 'Remove a column from the dataset',
  },
  {
    id: 'FILL_MISSING',
    name: 'Fill Missing Values',
    description: 'Fill null values with a specified value',
  },
  {
    id: 'UPPERCASE',
    name: 'Convert to Uppercase',
    description: 'Convert text column to uppercase',
  },
  {
    id: 'LOWERCASE',
    name: 'Convert to Lowercase',
    description: 'Convert text column to lowercase',
  },
  {
    id: 'TRIM_WHITESPACE',
    name: 'Trim Whitespace',
    description: 'Remove leading/trailing whitespace',
  },
];

export const TransformationPipeline: React.FC<TransformationPipelineProps> = ({
  steps,
  onAddStep,
  onRemoveStep,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isApplying,
}) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Transformation History
        </h3>

        <div className="flex gap-2 mb-4">
          <Button
            onClick={onUndo}
            disabled={!canUndo || isApplying}
            variant="outline"
            size="sm"
          >
            ↶ Undo
          </Button>
          <Button
            onClick={onRedo}
            disabled={!canRedo || isApplying}
            variant="outline"
            size="sm"
          >
            ↷ Redo
          </Button>
        </div>

        {steps.length > 0 ? (
          <div className="space-y-2">
            {steps.map((step, idx) => {
              const op = OPERATIONS.find((o) => o.id === step.operation);
              return (
                <div
                  key={step.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        Step {idx + 1}
                      </span>
                      <p className="font-medium text-gray-900">
                        {op?.name || step.operation}
                      </p>
                    </div>
                    {step.description && (
                      <p className="text-xs text-gray-500">{step.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => onRemoveStep(step.id)}
                    disabled={isApplying}
                    variant="outline"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            No transformations yet. Add one to get started.
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">
          Available Operations
        </h3>
        <div className="space-y-2">
          {OPERATIONS.map((op) => (
            <Button
              key={op.id}
              onClick={() =>
                onAddStep(op.id, {})
              }
              disabled={isApplying}
              variant="outline"
              className="w-full justify-start text-left h-auto py-2 px-3"
            >
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{op.name}</p>
                <p className="text-xs text-gray-500">{op.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};
