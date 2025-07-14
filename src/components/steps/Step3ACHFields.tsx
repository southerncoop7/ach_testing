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

  const handleFieldChange = (field: string, value: string) => {
    onUpdate('achFields', {
      ...data.achFields,
      [field]: value
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
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
          ACH Payment Fields
        </h2>
        <p className="text-gray-600">
          Configure the ACH payment fields for your test data generation.
        </p>
      </div>

      <div className="space-y-6">
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">ACH Field Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Routing Number:</strong> 9-digit ABA routing number</li>
            <li>• <strong>Account Number:</strong> Customer&apos;s bank account number</li>
            <li>• <strong>Amount:</strong> Payment amount in dollars and cents</li>
            <li>• <strong>Description:</strong> Optional payment description</li>
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
          disabled={!data.achFields.routingNumber || !data.achFields.accountNumber || !data.achFields.amount}
        >
          Next: Test Cases
        </Button>
      </div>
    </div>
  );
} 