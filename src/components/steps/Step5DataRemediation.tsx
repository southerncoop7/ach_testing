'use client';

import { useState, useEffect } from 'react';
import type { AppData } from '../../types/application';
import { Button } from '@/components/ui';

interface Step5DataRemediationProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function Step5DataRemediation({
  data,
  onNext,
  onPrevious,
}: Step5DataRemediationProps) {
  const [updateStatements, setUpdateStatements] = useState('');
  const [selectStatement, setSelectStatement] = useState('');

  useEffect(() => {
    const generateRemediationQueries = () => {
      const { testCaseConfig, databaseConfig, clearedChecksData } = data;
      const scenarios = testCaseConfig.scenarioCounts || {};
      const tableName = databaseConfig.tableName || 'your_table';
      const parsedData = clearedChecksData?.parsedData || [];

      const missingScenarios: string[] = [];

      for (const scenarioKey in scenarios) {
        const count = scenarios[scenarioKey];
        if (count > 0) {
          // This is a simplified check. In a real application, you would have a more robust way to check if a record matches a scenario.
          const hasScenario = parsedData.some(record => {
            if (scenarioKey === 'Y_null_null' && record.unclaimed_property_yn === 'Y' && !record.cleared_date && !record.void_date) return true;
            if (scenarioKey === 'Y_sysdate_null' && record.unclaimed_property_yn === 'Y' && record.cleared_date && !record.void_date) return true;
            // Add checks for other scenarios here
            return false;
          });

          if (!hasScenario) {
            missingScenarios.push(scenarioKey);
          }
        }
      }

      if (missingScenarios.length > 0) {
        const updates = missingScenarios.map(scenarioKey => {
          return `-- Missing scenario: ${scenarioKey}\n-- Please write an UPDATE statement to create a record for this scenario.\n-- Example: UPDATE ${tableName} SET ... WHERE ...;\n`;
        }).join('\n');
        setUpdateStatements(updates);

        const selects = `SELECT * FROM ${tableName}; -- Re-query all data after running the UPDATE statements.`;
        setSelectStatement(selects);
      } else {
        // If no scenarios are missing, we can proceed to the next step.
        onNext();
      }
    };

    generateRemediationQueries();
  }, [data, onNext]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Data Remediation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your provided data is missing some test cases. Please run the following UPDATE statements, then re-query your data and paste it in the previous step.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold dark:text-white">UPDATE Statements:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 dark:text-white p-4 rounded-md overflow-x-auto">
            {updateStatements}
          </pre>
        </div>
        <div>
          <h3 className="font-semibold dark:text-white">SELECT Statement to Re-query:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 dark:text-white p-4 rounded-md overflow-x-auto">
            {selectStatement}
          </pre>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onPrevious}>
          Back to Paste Data
        </Button>
        <Button variant="primary" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
