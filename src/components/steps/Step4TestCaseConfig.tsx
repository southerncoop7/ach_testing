'use client';

import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Select } from '@/components/ui';
import { useState } from 'react';

import type { AppData } from '../../types/application';

interface Step4TestCaseConfigProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

export default function Step4TestCaseConfig({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step4TestCaseConfigProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleFieldChange = (field: string, value: string) => {
    onUpdate('testCaseConfig', {
      ...data.testCaseConfig,
      [field]: value
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!data.testCaseConfig.recordCount || Number(data.testCaseConfig.recordCount) <= 0) {
      newErrors.recordCount = 'Record count must be greater than 0';
    } else if (Number(data.testCaseConfig.recordCount) > 10000) {
      newErrors.recordCount = 'Record count cannot exceed 10,000';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Test Case Configuration
        </h2>
        <p className="text-gray-600">
          Configure your test scenarios and data generation parameters.
        </p>
      </div>

      <div className="space-y-6">
        <Select
          label="Test Case Type"
          value={data.testCaseConfig.testCaseType}
          onChange={(value) => handleFieldChange('testCaseType', value)}
          options={[
            { value: 'basic', label: 'Basic ACH Payment' },
            { value: 'batch', label: 'Batch Processing' },
            { value: 'error', label: 'Error Scenarios' },
            { value: 'custom', label: 'Custom Configuration' }
          ]}
        />

        <Input
          label="Number of Records"
          value={data.testCaseConfig.recordCount.toString()}
          onChange={(value) => handleFieldChange('recordCount', value)}
          placeholder="100"
          type="number"
          error={errors.recordCount}
        />

        <div className="bg-[#E6F1F5] border border-[#B3D6E6] rounded-lg p-4">
          <h3 className="text-sm font-medium text-[#004F71] mb-2">Test Case Types:</h3>
          <ul className="text-sm text-[#004F71] space-y-1">
            <li>• <strong>Basic ACH Payment:</strong> Standard single payment records</li>
            <li>• <strong>Batch Processing:</strong> Multiple payments in batch format</li>
            <li>• <strong>Error Scenarios:</strong> Invalid routing numbers, amounts, etc.</li>
            <li>• <strong>Custom Configuration:</strong> User-defined test parameters</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-black mb-2">Performance Note:</h3>
          <p className="text-sm text-black">
            Large record counts may take longer to generate. For testing, we recommend starting with 100-1000 records.
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!data.testCaseConfig.recordCount || Number(data.testCaseConfig.recordCount) <= 0}
        >
          Next: Data Generation
        </Button>
      </div>
    </div>
  );
} 