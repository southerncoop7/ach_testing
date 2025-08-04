'use client';

import { useState } from 'react';
import type { AppData } from '../../types/application';
import { Button, Input } from '@/components/ui';

/**
 * Props for the Step3ACHFields component.
 */
interface Step3ACHFieldsProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

/**
 * Component for Step 3: Test Data Entry.
 * This step collects the necessary data fields for either ACH or Cleared Checks,
 * depending on the output format selected in a previous step. It includes
 * dynamic field rendering and validation.
 */
export default function Step3ACHFields({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step3ACHFieldsProps) {
  // State to hold validation errors for the form fields.
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Determine if the current mode is for "Cleared Checks" based on the output format.
  const isClearedChecks = data.databaseConfig.outputFormat === 'cleared-checks';

  /**
   * Configuration for the "Cleared Checks" fields.
   * Defines the required fields, their labels, placeholders, and length constraints.
   */
  const clearedChecksFields = [
    { key: 'bankAccountNumber', label: 'Bank Account Number', placeholder: 'e.g. 0001234567890', length: 13 },
    { key: 'checkNumber', label: 'Check Number', placeholder: 'e.g. 0000123456', length: 10 },
    { key: 'amount', label: 'Amount (no decimal)', placeholder: 'e.g. 0000012345', length: 10 },
    { key: 'date', label: 'Date (MMDDYY)', placeholder: 'e.g. 071524', length: 6 },
  ];

  /**
   * Handles changes to the input fields.
   * It updates the correct slice of the application state (achFields or clearedChecksFields).
   * @param {string} field - The name of the field being changed.
   * @param {string} value - The new value of the field.
   */
  const handleFieldChange = (field: string, value: string) => {
    const stateKey = isClearedChecks ? 'clearedChecksFields' : 'achFields';
    const currentFields = isClearedChecks ? data.clearedChecksFields : data.achFields;
    
    onUpdate(stateKey, {
      ...currentFields,
      [field]: value
    });

    // Clear the error for the field when the user starts typing.
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validates the form fields based on the current mode (ACH or Cleared Checks).
   * @returns {boolean} - True if the form is valid, otherwise false.
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (isClearedChecks) {
      // For Cleared Checks, validation is lenient to allow for auto-generation.
      // It only validates fields that have been filled in.
      clearedChecksFields.forEach(f => {
        const val = data.clearedChecksFields?.[f.key as keyof typeof data.clearedChecksFields] || '';
        if (val && f.key === 'amount' && !/^\d{1,10}$/.test(val)) {
          newErrors[f.key] = 'Amount must be up to 10 digits, with no decimal.';
        }
        if (val && f.key === 'date' && !/^\d{6}$/.test(val)) {
          newErrors[f.key] = 'Date must be 6 digits in MMDDYY format.';
        }
        if (val && f.length && val.length > f.length) {
          newErrors[f.key] = `Maximum length is ${f.length} characters.`;
        }
      });
    } else {
      // For ACH, fields are generally required.
      if (!data.achFields.routingNumber.trim()) {
        newErrors.routingNumber = 'Routing number is required.';
      } else if (!/^\d{9}$/.test(data.achFields.routingNumber)) {
        newErrors.routingNumber = 'Routing number must be exactly 9 digits.';
      }
      if (!data.achFields.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required.';
      }
      if (!data.achFields.amount.trim()) {
        newErrors.amount = 'Amount is required.';
      } else if (isNaN(Number(data.achFields.amount)) || Number(data.achFields.amount) <= 0) {
        newErrors.amount = 'Amount must be a positive number.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles the click event for the "Next" button.
   * Validates the form before proceeding.
   */
  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Test Data Configuration
        </h2>
        <p className="text-gray-600">
          {isClearedChecks
            ? 'Enter base values for the Cleared Checks data. Leave fields blank to have them auto-generated.'
            : 'Configure the ACH payment fields for test data generation.'}
        </p>
      </div>

      <div className="space-y-6">
        {isClearedChecks ? (
          clearedChecksFields.map(f => (
            <Input
              key={f.key}
              label={f.label}
              value={data.clearedChecksFields?.[f.key as keyof typeof data.clearedChecksFields] || ''}
              onChange={value => handleFieldChange(f.key, value)}
              placeholder={f.placeholder}
              error={errors[f.key]}
            />
          ))
        ) : (
          <>
            <Input
              label="Routing Number"
              value={data.achFields.routingNumber}
              onChange={(value) => handleFieldChange('routingNumber', value)}
              placeholder="123456789"
              error={errors.routingNumber}
            />
            <Input
              label="Account Number"
              value={data.achFields.accountNumber}
              onChange={(value) => handleFieldChange('accountNumber', value)}
              placeholder="1234567890"
              error={errors.accountNumber}
            />
            <Input
              label="Amount"
              value={data.achFields.amount}
              onChange={(value) => handleFieldChange('amount', value)}
              placeholder="100.00"
              type="number"
              error={errors.amount}
            />
            <Input
              label="Description"
              value={data.achFields.description}
              onChange={(value) => handleFieldChange('description', value)}
              placeholder="Payment description"
            />
          </>
        )}

        <div className="bg-[#E6F1F5] border border-[#B3D6E6] rounded-lg p-4">
          <h3 className="text-sm font-medium text-[#004F71] mb-2">
            Field Guidelines
          </h3>
          <ul className="text-sm text-[#004F71] space-y-1">
            {isClearedChecks ? (
              <>
                <li><strong>Bank Account Number:</strong> 13 digits, will be left-padded with zeros.</li>
                <li><strong>Check Number:</strong> 10 digits, will be left-padded with zeros.</li>
                <li><strong>Amount:</strong> 10 digits, no decimal (e.g., $123.45 is entered as "12345").</li>
                <li><strong>Date:</strong> 6 digits in MMDDYY format.</li>
                <li>Any field left blank will be auto-generated with valid data.</li>
              </>
            ) : (
              <>
                <li><strong>Routing Number:</strong> A 9-digit ABA routing number.</li>
                <li><strong>Account Number:</strong> The customer's bank account number.</li>
                <li><strong>Amount:</strong> The payment amount in dollars and cents.</li>
                <li><strong>Description:</strong> An optional description for the payment.</li>
              </>
            )}
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
          disabled={
            !isClearedChecks && (!data.achFields.routingNumber || !data.achFields.accountNumber || !data.achFields.amount)
          }
        >
          Next: Test Cases
        </Button>
      </div>
    </div>
  );
}