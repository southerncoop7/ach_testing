'use client';

import { useState } from 'react';
import type { AppData } from '../../types/application';
import { Button, Input, Select } from '@/components/ui';

/**
 * Props for the Step4TestCaseConfig component.
 */
interface Step4TestCaseConfigProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

/**
 * Component for Step 4: Test Case Configuration.
 * This step allows the user to configure the type and number of test cases to generate.
 * It displays different options based on the output format selected in previous steps.
 */
export default function Step4TestCaseConfig({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step4TestCaseConfigProps) {
  // State to hold validation errors for the form fields.
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  /**
   * Handles changes to the main test case configuration fields (e.g., type, record count).
   * @param {string} field - The name of the field being changed.
   * @param {string} value - The new value of the field.
   */
  const handleFieldChange = (field: string, value: string) => {
    onUpdate('testCaseConfig', {
      ...data.testCaseConfig,
      [field]: value
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validates the form fields.
   * @returns {boolean} - True if the form is valid, otherwise false.
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const recordCount = Number(data.testCaseConfig.recordCount);

    if (isClearedChecks) {
      // For Cleared Checks, validation is based on the sum of scenario counts.
      const totalScenarioRecords = Object.values(data.testCaseConfig.scenarioCounts || {}).reduce((sum, count) => sum + count, 0);
      if (totalScenarioRecords <= 0) {
        newErrors.recordCount = 'At least one scenario must have a record count greater than 0.';
      } else if (totalScenarioRecords > 10000) {
        newErrors.recordCount = 'Total record count from all scenarios cannot exceed 10,000.';
      }
    } else {
      // For other formats, validate the main record count field.
      if (!recordCount || recordCount <= 0) {
        newErrors.recordCount = 'Record count must be a positive number.';
      } else if (recordCount > 10000) {
        newErrors.recordCount = 'Record count cannot exceed 10,000.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the click event for the "Next" button.
   */
  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
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
    const count = Number(value);
    onUpdate('testCaseConfig', {
      ...data.testCaseConfig,
      scenarioCounts: {
        ...(data.testCaseConfig.scenarioCounts || {}),
        [key]: isNaN(count) ? 0 : count
      }
    });
  };

  // Determine if the current mode is for "Cleared Checks".
  const isClearedChecks = data.databaseConfig.outputFormat === 'cleared-checks';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Test Case Configuration
        </h2>
        <p className="text-gray-600">
          Configure your test scenarios and the amount of data to generate.
        </p>
      </div>

      <div className="space-y-6">
        {isClearedChecks ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Cleared Checks Scenarios</h3>
            <p className="text-sm text-blue-800 mb-4">
              Enter the number of records to generate for each specific scenario. Leave blank or set to 0 to skip a scenario.
            </p>
            <div className="space-y-2">
              {SCENARIOS.map((s, idx) => (
                <div key={s.key} className="flex items-center space-x-4 p-2 rounded-md hover:bg-blue-100">
                  <span className="w-8 text-right text-sm font-medium text-gray-700">{idx + 1}.</span>
                  <label htmlFor={`scenario-${s.key}`} className="flex-1 text-sm text-gray-900">{s.label}</label>
                  <Input
                    id={`scenario-${s.key}`}
                    type="number"
                    min="0"
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
        ) : (
          <>
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
              label="Number of Records to Generate"
              value={data.testCaseConfig.recordCount.toString()}
              onChange={(value) => handleFieldChange('recordCount', value)}
              placeholder="e.g., 100"
              type="number"
              error={errors.recordCount}
            />
          </>
        )}

        {!isClearedChecks && (
          <div className="bg-[#E6F1F5] border border-[#B3D6E6] rounded-lg p-4">
            <h3 className="text-sm font-medium text-[#004F71] mb-2">Test Case Type Descriptions:</h3>
            <ul className="text-sm text-[#004F71] space-y-1">
              <li><strong>Basic ACH Payment:</strong> Generates standard, valid payment records.</li>
              <li><strong>Batch Processing:</strong> Creates multiple payments grouped into a single batch.</li>
              <li><strong>Error Scenarios:</strong> Intentionally creates records with errors like invalid routing numbers.</li>
              <li><strong>Custom Configuration:</strong> Allows for more detailed, user-defined test parameters.</li>
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
        >
          Next: Data Generation
        </Button>
      </div>
    </div>
  );
}