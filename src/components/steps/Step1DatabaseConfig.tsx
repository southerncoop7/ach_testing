'use client';

import { useState } from 'react';
import type { AppData } from '../../types/application';
import { Button, Input, Select } from '@/components/ui';

/**
 * Props for the Step1DatabaseConfig component.
 */
interface Step1DatabaseConfigProps {
  /** The current application data. */
  data: AppData;
  /** Function to update the application data. */
  onUpdate: (key: string, value: unknown) => void;
  /** Function to proceed to the next step. */
  onNext: () => void;
  /** Function to go back to the previous step. */
  onPrevious: () => void;
  /** Indicates if the current step is complete. */
  isComplete: boolean;
}

/**
 * Component for Step 1: Database Configuration.
 * This step collects the database name and the desired output format.
 */
export default function Step1DatabaseConfig({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step1DatabaseConfigProps) {
  // State to hold validation errors for the form fields.
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  /**
   * Validates the form fields for the current step.
   * @returns {boolean} - True if the form is valid, otherwise false.
   */
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

  /**
   * Handles the click event for the "Next" button.
   * Validates the form before proceeding to the next step.
   */
  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  /**
   * Handles changes to the database name input field.
   * @param {string} value - The new value for the database name.
   */
  const handleDatabaseNameChange = (value: string) => {
    onUpdate('databaseConfig', {
      ...data.databaseConfig,
      databaseName: value
    });
    // Clear the error message when the user starts typing.
    if (errors.databaseName) {
      setErrors(prev => ({ ...prev, databaseName: '' }));
    }
  };

  /**
   * Handles changes to the output format select field.
   * @param {string} value - The new value for the output format.
   */
  const handleOutputFormatChange = (value: string) => {
    onUpdate('databaseConfig', {
      ...data.databaseConfig,
      outputFormat: value as 'sql' | 'fixed-width' | 'nacha'
    });
    // Clear the error message when the user selects an option.
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
            { value: 'nacha', label: 'NACHA Format File' },
            { value: 'cleared-checks', label: 'Cleared Checks (Fixed Width)' },
          ]}
          error={errors.outputFormat}
        />

        <div className="bg-[#E6F1F5] border border-[#B3D6E6] rounded-lg p-4">
          <h3 className="text-sm font-medium text-[#004F71] mb-2">Output Format Details:</h3>
          <ul className="text-sm text-[#004F71] space-y-1">
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