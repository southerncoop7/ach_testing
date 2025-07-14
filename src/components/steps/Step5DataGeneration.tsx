'use client';

import { Button } from '@/components/ui';
import { useState } from 'react';

import type { AppData } from '../../types/application';

interface Step5DataGenerationProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

export default function Step5DataGeneration({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step5DataGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<Array<{
    id: number;
    routingNumber: string;
    accountNumber: string;
    amount: string;
    description: string;
    transactionDate: string;
    status: string;
  }>>([]);

  const generateTestData = () => {
    setIsGenerating(true);
    
    // Simulate data generation
    setTimeout(() => {
      const mockData = [];
      const recordCount = Number(data.testCaseConfig.recordCount);
      
      for (let i = 0; i < Math.min(recordCount, 10); i++) { // Show first 10 records
        mockData.push({
          id: i + 1,
          routingNumber: data.achFields.routingNumber,
          accountNumber: `${data.achFields.accountNumber}${i.toString().padStart(3, '0')}`,
          amount: (Number(data.achFields.amount) + (i * 10)).toFixed(2),
          description: `${data.achFields.description || 'Payment'} #${i + 1}`,
          transactionDate: new Date().toISOString().split('T')[0],
          status: 'pending'
        });
      }
      
      setGeneratedData(mockData);
      onUpdate('generatedData', { records: mockData, totalCount: recordCount });
      setIsGenerating(false);
    }, 2000);
  };

  const handleNext = () => {
    if (generatedData.length > 0) {
      onNext();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Data Generation
        </h2>
        <p className="text-gray-600">
          Generate ACH payment test data based on your configuration.
        </p>
      </div>

      <div className="space-y-6">
        {!generatedData.length && (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Data</h3>
            <p className="text-gray-600 mb-6">
              Click the button below to generate {data.testCaseConfig.recordCount} ACH payment records.
            </p>
            <Button
              variant="primary"
              onClick={generateTestData}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Test Data'}
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating {data.testCaseConfig.recordCount} ACH payment records...</p>
          </div>
        )}

        {generatedData.length > 0 && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-2">
                ✓ Data Generation Complete
              </h3>
              <p className="text-sm text-green-800">
                Successfully generated {data.testCaseConfig.recordCount} ACH payment records.
                Showing preview of first 10 records below.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Routing #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedData.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.routingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.accountNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${record.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.transactionDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center">
              <Button
                variant="secondary"
                onClick={generateTestData}
                disabled={isGenerating}
              >
                Regenerate Data
              </Button>
            </div>
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
          disabled={generatedData.length === 0}
        >
          Next: Output Generation
        </Button>
      </div>
    </div>
  );
} 