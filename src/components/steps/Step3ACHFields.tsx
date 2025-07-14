'use client';

import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useState } from 'react';

import type { AppData } from '../../types/application';

interface Step3ACHFieldsProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

export default function Step3ACHFields({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step3ACHFieldsProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Determine which fields to show based on outputFormat
  const isClearedChecks = data.databaseConfig.outputFormat === 'cleared-checks';

  // Cleared Checks field config
  const clearedChecksFields = [
    { key: 'bankAccountNumber', label: 'Bank Account Number', placeholder: 'e.g. 0001234567890', length: 13 },
    { key: 'checkNumber', label: 'Check Number', placeholder: 'e.g. 0000123456', length: 10 },
    { key: 'amount', label: 'Amount (no decimal)', placeholder: 'e.g. 0000012345', length: 10 },
    { key: 'date', label: 'Date (MMDDYY)', placeholder: 'e.g. 071524', length: 6 },
  ];

  const handleFieldChange = (field: string, value: string) => {
    onUpdate(isClearedChecks ? 'clearedChecksFields' : 'achFields', {
      ...(isClearedChecks ? data.clearedChecksFields : data.achFields),
      [field]: value
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (isClearedChecks) {
      // Only validate if field is present (allow blank for auto-gen)
      clearedChecksFields.forEach(f => {
        const val = data.clearedChecksFields?.[f.key] || '';
        if (val && f.key === 'amount' && (!/^\d{1,10}$/.test(val))) {
          newErrors[f.key] = 'Amount must be up to 10 digits, no decimal';
        }
        if (val && f.key === 'date' && (!/^\d{6}$/.test(val))) {
          newErrors[f.key] = 'Date must be 6 digits (MMDDYY)';
        }
        if (val && f.length && val.length > f.length) {
          newErrors[f.key] = `Max length is ${f.length} digits`;
        }
      });
    } else {
      if (!data.achFields.routingNumber.trim()) {
        newErrors.routingNumber = 'Routing number is required';
      } else if (!/^\d{9}$/.test(data.achFields.routingNumber)) {
        newErrors.routingNumber = 'Routing number must be 9 digits';
      }
      if (!data.achFields.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!data.achFields.amount.trim()) {
        newErrors.amount = 'Amount is required';
      } else if (isNaN(Number(data.achFields.amount)) || Number(data.achFields.amount) <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      }
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
          Test Data
        </h2>
        <p className="text-gray-600">
          {isClearedChecks
            ? 'Enter the Cleared Checks fields for your test data. Leave any blank to auto-generate conforming data.'
            : 'Configure the ACH payment fields for your test data generation.'}
        </p>
      </div>

      <div className="space-y-6">
        {isClearedChecks ? (
          clearedChecksFields.map(f => (
            <Input
              key={f.key}
              label={f.label}
              value={data.clearedChecksFields?.[f.key] || ''}
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
            {isClearedChecks ? 'Cleared Checks Field Guidelines:' : 'ACH Field Guidelines:'}
          </h3>
          <ul className="text-sm text-[#004F71] space-y-1">
            {isClearedChecks ? (
              <>
                <li>• <strong>Bank Account Number:</strong> 13 digits, left-padded with zeros</li>
                <li>• <strong>Check Number:</strong> 10 digits, left-padded with zeros</li>
                <li>• <strong>Amount:</strong> 10 digits, no decimal, left-padded with zeros (e.g., $123.45 → "0000012345")</li>
                <li>• <strong>Date:</strong> 6 digits, MMDDYY</li>
                <li>• Leave any field blank to auto-generate conforming data</li>
              </>
            ) : (
              <>
                <li>• <strong>Routing Number:</strong> 9-digit ABA routing number</li>
                <li>• <strong>Account Number:</strong> Customer's bank account number</li>
                <li>• <strong>Amount:</strong> Payment amount in dollars and cents</li>
                <li>• <strong>Description:</strong> Optional payment description</li>
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
          // For Cleared Checks, allow all fields blank (auto-gen), so always enabled
          disabled={
            isClearedChecks
              ? false
              : (!data.achFields.routingNumber || !data.achFields.accountNumber || !data.achFields.amount)
          }
        >
          Next: Test Cases
        </Button>
      </div>
    </div>
  );
} 