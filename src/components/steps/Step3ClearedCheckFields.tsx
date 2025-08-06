'use client';

import { useState, useEffect } from 'react';
import type { AppData } from '../../types/application';
import { Button } from '@/components/ui';

interface StepProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

export default function Step3ClearedCheckFields({
  data,
  onNext,
  onPrevious
}: StepProps) {
  const [generatedQueries, setGeneratedQueries] = useState<string[]>([]);

  useEffect(() => {
    const generateQueries = () => {
      const queries: string[] = [];
      const { tableName } = data.databaseConfig;
      const { scenarioCounts } = data.testCaseConfig;

      if (!data.databaseConfig.tableName || !scenarioCounts) {
        return;
      }

      const scenarioToWhereClause: { [key: string]: string } = {
        'Y_null_null': 'unclaimed_property_yn = "y" AND cleared_date IS NULL AND void_date IS NULL',
        'Y_sysdate_null': 'unclaimed_property_yn = "y" AND cleared_date = SYSDATE AND void_date IS NULL',
        'Y_sysdate_sysdate': 'unclaimed_property_yn = "y" AND cleared_date = SYSDATE AND void_date = SYSDATE',
        'Y_null_sysdate': 'unclaimed_property_yn = "y" AND cleared_date IS NULL AND void_date = SYSDATE',
        'N_null_null': 'unclaimed_property_yn = "n" AND cleared_date IS NULL AND void_date IS NULL',
        'N_sysdate_null': 'unclaimed_property_yn = "n" AND cleared_date = SYSDATE AND void_date = SYSDATE',
        'N_null_sysdate': 'unclaimed_property_yn = "n" AND cleared_date IS NULL AND void_date = SYSDATE',
        'N_sysdate_sysdate': 'unclaimed_property_yn = "n" AND cleared_date = SYSDATE AND void_date = SYSDATE',
      };

      for (const scenarioKey in scenarioCounts) {
        const count = scenarioCounts[scenarioKey];
        if (count > 0) {
          const whereClause = scenarioToWhereClause[scenarioKey];
          if (whereClause) {
            queries.push(`SELECT * FROM ${tableName} WHERE ${whereClause};`);
          }
        }
      }

      setGeneratedQueries(queries);
    };

    generateQueries();
  }, [data.databaseConfig, data.testCaseConfig]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generated SQL Queries
        </h2>
        <p className="text-gray-600">
          Based on your selections in the previous step, here are the generated SQL queries.
        </p>
      </div>

      {generatedQueries.length > 0 ? (
        <div className="space-y-4">
          {generatedQueries.map((query, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{query}</pre>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() => copyToClipboard(query)}
              >
                Copy
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p>No scenarios selected in the previous step.</p>
        </div>
      )}

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="primary" onClick={onNext}>
          Next: Schema Definition
        </Button>
      </div>
    </div>
  );
}
