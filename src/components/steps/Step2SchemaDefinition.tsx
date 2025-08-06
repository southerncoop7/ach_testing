'use client';

import { useState } from 'react';
import type { AppData } from '../../types/application';
import { Button, Input } from '@/components/ui';
import SchemaDefinitionContent from './SchemaDefinitionContent';

/**
 * Props for the Step2SchemaDefinition component.
 */
interface Step2SchemaDefinitionProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

/**
 * Component for Step 2: Test Case Configuration (for Cleared Checks) or Schema Definition (for ACH).
 * This step dynamically changes based on the file type selected in Step 1.
 */
export default function Step2SchemaDefinition({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step2SchemaDefinitionProps) {
  // State to hold validation errors for the form fields.
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // State to indicate if a file is being processed (only relevant for schema upload).
  const [isLoading, setIsLoading] = useState(false);
  // State to control the visibility of the field mapping UI.
  const [showMappingUI] = useState(false);
  /**
   * Validates the form fields.
   * @returns {boolean} - True if the form is valid, otherwise false.
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (isClearedChecks) {
      // For Cleared Checks, validation is based on the sum of scenario counts.
      const totalScenarioRecords = Object.values(data.testCaseConfig.scenarioCounts || {}).reduce((sum, count) => sum + count, 0);
      if (totalScenarioRecords <= 0) {
        newErrors.recordCount = 'At least one scenario must have a record count greater than 0.';
      } else if (totalScenarioRecords > 10000) {
        newErrors.recordCount = 'Total record count from all scenarios cannot exceed 10,000.';
      }
    } else {
      // For other formats (ACH), validate schema definition fields.
      if (!data.schemaDefinition.schema) {
        newErrors.schema = 'Please upload or select a schema file.';
      }
      if (showMappingUI) {
        newErrors.mapping = 'Please save the field mapping before proceeding.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Defines the special test scenarios for the "Cleared Checks" format.
   */
  const SCENARIOS = [
    { key: 'Y_null_null', label: "unclaimed_property_yn = 'Y', Cleared_date is null, void_date is null" },
    { key: 'Y_sysdate_null', label: "unclaimed_property_yn = 'Y', Cleared_date = SYSDATE, void_date is null" },
    { key: 'Y_sysdate_sysdate', label: "unclaimed_property_yn = 'Y', Cleared_date = SYSDATE, void_date = SYSDATE" },
    { key: 'Y_null_sysdate', label: "unclaimed_property_yn = 'Y', Cleared_date is NULL, void_date = SYSDATE" },
    { key: 'N_null_null', label: "unclaimed_property_yn = 'N', Cleared_date is null, void_date is null" },
    { key: 'N_sysdate_null', label: "unclaimed_property_yn = 'N', Cleared_date = SYSDATE, void_date is NULL" },
    { key: 'N_null_sysdate', label: "unclaimed_property_yn = 'N', Cleared_date is NULL, void_date = SYSDATE" },
    { key: 'N_sysdate_sysdate', label: "unclaimed_property_yn = 'N', Cleared_date = SYSDATE, void_date = SYSDATE" },
  ];

  /**
   * Handles changes to the record count for a specific scenario.
   * @param {string} key - The key of the scenario.
   * @param {string} value - The new record count for the scenario.
   */
  const handleScenarioCountChange = (key: string, value: string) => {
        const count = Math.max(0, Number(value));
    onUpdate('testCaseConfig', {
      ...data.testCaseConfig,
      scenarioCounts: {
        ...(data.testCaseConfig.scenarioCounts || {}),
        [key]: isNaN(count) ? 0 : count
      }
    });
  };

  // Determine if the current mode is for "Cleared Checks".
  const isClearedChecks = data.databaseConfig.outputFormat === 'cleared-check';

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    if (isClearedChecks) {
      onNext(); // Proceed to Cleared Check Fields (which is now step 3)
    } else {
      onNext(); // Proceed to ACH Fields (which is step 3 for ACH)
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isClearedChecks ? 'Test Case Configuration' : 'Schema Definition'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {isClearedChecks
            ? 'Configure your test scenarios and the amount of data to generate.'
            : 'Upload or select a SQL schema file to define your database structure.'}
        </p>
      </div>

      {isClearedChecks ? (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-gray-700 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-2">Cleared Checks Scenarios</h3>
            <p className="text-sm text-blue-800 dark:text-gray-300 mb-4">
              Enter the number of records to generate for each specific scenario. Leave blank or set to 0 to skip a scenario.
            </p>
            <div className="space-y-2">
              {SCENARIOS.map((s, idx) => (
                <div key={s.key} className="flex items-center space-x-4 p-2 rounded-md hover:bg-blue-100 dark:hover:bg-gray-600">
                  <span className="w-8 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{idx + 1}.</span>
                  <label htmlFor={`scenario-${s.key}`} className="flex-1 text-sm text-gray-900 dark:text-gray-200">{s.label}</label>
                  <Input
                    id={`scenario-${s.key}`}
                    type="number"
                    className="w-24"
                    value={data.testCaseConfig.scenarioCounts?.[s.key]?.toString() ?? ''}
                    onChange={value => handleScenarioCountChange(s.key, value)}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            {errors.recordCount && <p className="mt-4 text-sm text-red-600">{errors.recordCount}</p>}
          </div>
        </div>
      ) : (
        <SchemaDefinitionContent data={data} onUpdate={onUpdate} errors={errors} isLoading={isLoading} setIsLoading={setIsLoading} />
      )}

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNext}
        >
          Next: {isClearedChecks ? 'Cleared Check Fields' : 'ACH Fields'}
        </Button>
      </div>
    </div>
  );
}