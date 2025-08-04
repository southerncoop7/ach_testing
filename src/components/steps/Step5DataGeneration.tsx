'use client';

import { useState } from 'react';
import type { AppData } from '../../types/application';
import { Button } from '@/components/ui';

/**
 * Props for the Step5DataGeneration component.
 */
interface Step5DataGenerationProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

/**
 * Component for Step 5: Data Generation.
 * This step handles the generation of mock test data based on the user's configuration
 * from the previous steps. It shows a preview of the generated data.
 */
export default function Step5DataGeneration({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step5DataGenerationProps) {
  // State to track if data generation is in progress.
  const [isGenerating, setIsGenerating] = useState(false);
  // State to hold the generated data for preview.
  const [generatedData, setGeneratedData] = useState<Array<any>>([]);

  /**
   * Generates mock test data based on the user's configuration.
   * This is a simulation and should be replaced with actual data generation logic.
   */
  const generateTestData = () => {
    setIsGenerating(true);
    
    // Simulate a network delay for data generation.
    setTimeout(() => {
      const mockData = [];
      const isClearedChecks = data.databaseConfig.outputFormat === 'cleared-checks';
      
      if (isClearedChecks) {
        // Logic for generating "Cleared Checks" data based on scenarios.
        const scenarioCounts = data.testCaseConfig.scenarioCounts || {};
        let id = 1;
        for (const scenarioKey in scenarioCounts) {
          const count = scenarioCounts[scenarioKey];
          for (let i = 0; i < count; i++) {
            if (mockData.length >= 10) break; // Limit preview to 10 records
            mockData.push({
              id: id++,
              bankAccountNumber: data.clearedChecksFields.bankAccountNumber || `1234567890${String(id).padStart(3, '0')}`,
              checkNumber: data.clearedChecksFields.checkNumber || `987654${String(id).padStart(4, '0')}`,
              amount: data.clearedChecksFields.amount || `${10000 + i * 100}`,
              date: data.clearedChecksFields.date || '010125',
              scenario: scenarioKey,
            });
          }
          if (mockData.length >= 10) break;
        }
      } else {
        // Logic for generating standard ACH data.
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
      }
      
      setGeneratedData(mockData);
      onUpdate('generatedData', { records: mockData, totalCount: isClearedChecks ? mockData.length : Number(data.testCaseConfig.recordCount) });
      setIsGenerating(false);
    }, 1500); // Simulate 1.5 second delay
  };

  /**
   * Handles the click event for the "Next" button.
   * Proceeds to the next step only if data has been generated.
   */
  const handleNext = () => {
    if (generatedData.length > 0) {
      onNext();
    }
  };

  const isClearedChecks = data.databaseConfig.outputFormat === 'cleared-checks';
  const totalRecords = isClearedChecks
    ? Object.values(data.testCaseConfig.scenarioCounts || {}).reduce((sum, count) => sum + count, 0)
    : Number(data.testCaseConfig.recordCount);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Data Generation
        </h2>
        <p className="text-gray-600">
          Generate the test data based on your configuration. A preview will be shown below.
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
              Click the button below to generate {totalRecords} records.
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
            <p className="text-gray-600">Generating {totalRecords} records...</p>
          </div>
        )}

        {generatedData.length > 0 && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-2">
                ✓ Data Generation Complete
              </h3>
              <p className="text-sm text-green-800">
                Successfully generated {totalRecords} records. A preview of the first {generatedData.length} records is shown below.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(generatedData[0] || {}).map(key => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedData.map((record, index) => (
                    <tr key={index}>
                      {Object.values(record).map((value, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value}
                        </td>
                      ))}
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
          disabled={generatedData.length === 0 || isGenerating}
        >
          Next: Output Generation
        </Button>
      </div>
    </div>
  );
}