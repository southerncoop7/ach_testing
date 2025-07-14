'use client';

import { Button } from '@/components/ui';
import { Select } from '@/components/ui';
import { useState } from 'react';

import type { AppData } from '../../types/application';

interface Step2SchemaDefinitionProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

export default function Step2SchemaDefinition({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step2SchemaDefinitionProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleMethodChange = (value: string) => {
    onUpdate('schemaDefinition', {
      ...data.schemaDefinition,
      method: value
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      // Simulate file processing (e.g., SQL parsing)
      setTimeout(() => {
        onUpdate('schemaDefinition', {
          ...data.schemaDefinition,
          schema: { fileName: file.name, content: null }
        });
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleNext = () => {
    if (data.schemaDefinition.method === 'upload' && !data.schemaDefinition.schema) {
      setErrors({ schema: 'Please upload a schema file' });
      return;
    }
    onNext();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Schema Definition
        </h2>
        <p className="text-gray-600">
          Choose how to define your database schema for ACH payment data.
        </p>
      </div>

      <div className="space-y-6">
        <Select
          label="Schema Method"
          value={data.schemaDefinition.method}
          onChange={handleMethodChange}
          options={[
            { value: 'upload', label: 'Upload SQL Schema File' },
            { value: 'manual', label: 'Manual Schema Entry' }
          ]}
        />

        {data.schemaDefinition.method === 'upload' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload SQL Schema File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".sql"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="schema-file"
                  disabled={isLoading}
                />
                <label htmlFor="schema-file" className={`cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}` }>
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2">Click to upload SQL schema file</p>
                    <p className="text-xs text-gray-500">Supports .sql files</p>
                  </div>
                </label>
                {isLoading && (
                  <div className="mt-4 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <span className="text-blue-600 text-sm">Processing file...</span>
                  </div>
                )}
              </div>
              {data.schemaDefinition.schema && !isLoading && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ File uploaded: {data.schemaDefinition.schema.fileName}
                </p>
              )}
              {errors.schema && (
                <p className="mt-2 text-sm text-red-600">{errors.schema}</p>
              )}
            </div>
          </div>
        )}

        {data.schemaDefinition.method === 'manual' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-900 mb-2">Manual Schema Entry</h3>
              <p className="text-sm text-yellow-800">
                Manual schema entry will be implemented in the next iteration. For now, please use the upload option.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#E6F1F5] border border-[#B3D6E6] rounded-lg p-4">
          <h3 className="text-sm font-medium text-[#004F71] mb-2">Schema Requirements:</h3>
          <ul className="text-sm text-[#004F71] space-y-1">
            <li>• Must contain CREATE TABLE statements</li>
            <li>• Should include fields for ACH payment data</li>
            <li>• Supported formats: SQL files (.sql)</li>
            <li>• File size limit: 1MB</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={(data.schemaDefinition.method === 'upload' && (!data.schemaDefinition.schema || isLoading)) || isLoading}
        >
          Next: ACH Fields
        </Button>
      </div>
    </div>
  );
} 