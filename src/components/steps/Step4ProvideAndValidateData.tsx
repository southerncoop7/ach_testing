'use client';

import { useState } from 'react';
import type { AppData } from '../../types/application';
import { Button } from '@/components/ui';

interface Step4ProvideAndValidateDataProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step4ProvideAndValidateData({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: Step4ProvideAndValidateDataProps) {
  const [pastedData, setPastedData] = useState(data.clearedChecksData?.pastedData || '');
  const [error, setError] = useState<string | null>(null);

  const parseTsv = (tsv: string): Record<string, string>[] => {
    const lines = tsv.trim().split('\n');
    if (lines.length === 0) return [];

    // Define the headers based on the columns from the SELECT statement
    const headers = ['check_number', 'amount', 'check_date', 'unclaimed_property_yn', 'cleared_date', 'void_date'];

    return lines.map(line => {
      const values = line.split('\t').map(v => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || ''; // Handle cases where a value might be missing
        return obj;
      }, {} as Record<string, string>);
    });
  };

  const handleValidate = () => {
    setError(null);
    if (pastedData.trim() === '') {
      setError('Please paste data before proceeding.');
      return;
    }

    const parsedData = parseTsv(pastedData);
    const requestedRecordCount = Object.values(data.testCaseConfig.scenarioCounts || {}).reduce((sum, count) => sum + count, 0);

    if (parsedData.length !== requestedRecordCount) {
      setError(`The number of records you pasted (${parsedData.length}) does not match the number of records you requested (${requestedRecordCount}). Please ensure you have copied all the data.`);
      return;
    }

    onUpdate('clearedChecksData', { pastedData, parsedData });
    onNext();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Provide and Validate Data
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Paste the data returned from the SQL queries in the previous step.
        </p>
      </div>

      <textarea
        className="w-full h-64 p-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
        value={pastedData}
        onChange={(e) => setPastedData(e.target.value)}
        placeholder="Paste your data here in CSV format..."
      />

      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="primary" onClick={handleValidate}>
          Validate and Continue
        </Button>
      </div>
    </div>
  );
}
