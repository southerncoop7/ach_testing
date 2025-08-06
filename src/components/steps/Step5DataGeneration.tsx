'use client';

import { useState, useEffect } from 'react';
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
}

/**
 * Component for Step 3 (Cleared Checks): Test Data Queries.
 * This step generates SQL queries based on the selected test scenarios.
 */
export default function Step5DataGeneration({
  data,
  onNext,
  onPrevious,
}: Step5DataGenerationProps) {
  const [sqlQueries, setSqlQueries] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const generateSqlQueries = () => {
      const { testCaseConfig, databaseConfig } = data;
      const scenarios = testCaseConfig.scenarioCounts || {};
      const tableName = databaseConfig.tableName || 'your_table';

      const scenarioToWhereClause: { [key: string]: string } = {
        'Y_null_null': "unclaimed_property_yn = 'Y' AND cleared_date IS NULL AND void_date IS NULL",
        'Y_sysdate_null': "unclaimed_property_yn = 'Y' AND cleared_date IS NOT NULL AND void_date IS NULL",
        'Y_sysdate_sysdate': "unclaimed_property_yn = 'Y' AND cleared_date IS NOT NULL AND void_date IS NOT NULL",
        'Y_null_sysdate': "unclaimed_property_yn = 'Y' AND cleared_date IS NULL AND void_date IS NOT NULL",
        'N_null_null': "unclaimed_property_yn = 'N' AND cleared_date IS NULL AND void_date IS NULL",
        'N_sysdate_null': "unclaimed_property_yn = 'N' AND cleared_date IS NOT NULL AND void_date IS NULL",
        'N_null_sysdate': "unclaimed_property_yn = 'N' AND cleared_date IS NULL AND void_date IS NOT NULL",
        'N_sysdate_sysdate': "unclaimed_property_yn = 'N' AND cleared_date IS NOT NULL AND void_date IS NOT NULL"
      };

      const scenarioToOrderBy: { [key: string]: string } = {
        'Y_sysdate_null': 'cleared_date',
        'Y_sysdate_sysdate': 'cleared_date',
        'Y_null_sysdate': 'void_date',
        'N_sysdate_null': 'cleared_date',
        'N_null_sysdate': 'void_date',
        'N_sysdate_sysdate': 'cleared_date'
      };

      const queries = Object.keys(scenarios).map(key => {
        const count = scenarios[key];
        if (!count || count === 0) return null;

        const whereClause = scenarioToWhereClause[key];
        if (!whereClause) return null;

        const orderByColumn = scenarioToOrderBy[key];
        const orderByClause = orderByColumn ? `ORDER BY ${orderByColumn} DESC` : '';

        return `-- Scenario: ${key} (${count} records)
SELECT check_number,amount,check_date, unclaimed_property_yn,cleared_date,void_date FROM ${tableName} WHERE ${whereClause} ${orderByClause} FETCH FIRST ${count} ROWS ONLY;
`;
      }).filter(Boolean).join('\n');

      setSqlQueries(queries);
    };

    generateSqlQueries();
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlQueries);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Test Data Queries
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here are the SQL queries based on your selected test scenarios. Please run these against your database.
        </p>
      </div>

      <div className="relative">
        <textarea
          className="w-full h-64 p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600"
          value={sqlQueries}
          readOnly
        />
        <Button
          variant="secondary"
          onClick={handleCopy}
          className="absolute top-2 right-2"
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="primary" onClick={onNext}>
          Next: Provide and Validate Data
        </Button>
      </div>
    </div>
  );
}
