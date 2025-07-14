'use client';

import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Select } from '@/components/ui';
import { useState } from 'react';
import type { AppData } from '../../types/application';

interface Step1DatabaseConfigProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

export default function Step1DatabaseConfig({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step1DatabaseConfigProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!data.databaseConfig.databaseName.trim()) {
      newErrors.databaseName = 'Database name is required';
    }
    
    if (!data.databaseConfig.outputFormat) {
      newErrors.outputFormat = 'Output format is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleDatabaseNameChange = (value: string) => {
    onUpdate('databaseConfig', {
      ...data.databaseConfig,
      databaseName: value
    });
    if (errors.databaseName) {
      setErrors(prev => ({ ...prev, databaseName: '' }));
    }
  };

  const handleOutputFormatChange = (value: string) => {
    onUpdate('databaseConfig', {
      ...data.databaseConfig,
      outputFormat: value as 'sql' | 'fixed-width' | 'nacha'
    });
    if (errors.outputFormat) {
      setErrors(prev => ({ ...prev, outputFormat: '' }));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Database Configuration
        </h2>
        <p className="text-gray-600">
          Configure your database settings and output format for the ACH payment test data.
        </p>
      </div>

      <div className="space-y-6">
        <Input
          label="Database Name"
          value={data.databaseConfig.databaseName}
          onChange={handleDatabaseNameChange}
          placeholder="Enter database name (e.g., ach_test_db)"
          error={errors.databaseName}
        />

        <Select
          label="Output Format"
          value={data.databaseConfig.outputFormat}
          onChange={handleOutputFormatChange}
          options={[
            { value: 'sql', label: 'SQL Insert Statements' },
            { value: 'fixed-width', label: 'Fixed Width Text File' },
            { value: 'nacha', label: 'NACHA Format File' }
          ]}
          error={errors.outputFormat}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Output Format Details:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>SQL Insert Statements:</strong> Ready-to-execute SQL INSERT statements</li>
            <li><strong>Fixed Width Text File:</strong> Standard ACH file format with fixed-width fields</li>
            <li><strong>NACHA Format File:</strong> NACHA-compliant ACH file with proper headers and trailers</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={true} // No previous step on step 1
        >
          Previous
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!data.databaseConfig.databaseName.trim() || !data.databaseConfig.outputFormat}
        >
          Next: Schema Definition
        </Button>
      </div>
    </div>
  );
} 