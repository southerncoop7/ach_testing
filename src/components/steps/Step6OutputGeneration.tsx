'use client';

import { useState, useEffect } from 'react';
import type { AppData } from '../../types/application';
import { Button } from '@/components/ui';

/**
 * Props for the Step6OutputGeneration component.
 */
interface Step6OutputGenerationProps {
  data: AppData;
  onPrevious: () => void;
}

/**
 * Component for Step 6: Output Generation.
 * This final step generates and allows the user to download the test data files.
 */
export default function Step6OutputGeneration({
  data,
  onPrevious,
}: Step6OutputGenerationProps) {
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);
  const [monitoringQuery, setMonitoringQuery] = useState<string>('');

  const formatClearedCheckFile = (records: Record<string, string>[]) => {
    // This is a simplified fixed-width format. Adjust the padding as needed.
    const header = 'AccountNumber      CheckNumber          Amount Date\n';
    const rows = records.map(r => {
      const accountNumber = r.bankAccountNumber?.padEnd(20) || ''.padEnd(20);
      const checkNumber = r.checkNumber?.padEnd(20) || ''.padEnd(20);
      const amount = r.amount?.padEnd(15) || ''.padEnd(15);
      const date = r.date?.padEnd(10) || ''.padEnd(10);
      return `${accountNumber}${checkNumber}${amount}${date}`;
    }).join('\n');
    return header + rows;
  };

  useEffect(() => {
    const generateFiles = () => {
      const files = [];
      const format = data.databaseConfig.outputFormat;
      
      if (format === 'cleared-check') {
        files.push('cleared_checks.txt');
        files.push('cleared_checks_updates.sql');
      } else {
        files.push('ach_output.txt');
        files.push('ach_inserts.sql');
      }
      
      setGeneratedFiles(files);

      // Generate monitoring query
      const tableName = data.databaseConfig.tableName || 'your_table';
      const checkNumbers = data.clearedChecksData?.parsedData?.map(r => r.checkNumber).filter(Boolean).join(', ') || ''
      const monitoringSelect = `SELECT * FROM ${tableName} WHERE check_number IN (${checkNumbers});`;
      setMonitoringQuery(monitoringSelect);
    };

    generateFiles();
  }, [data]);

  const downloadFile = (filename: string) => {
    const parsedData = data.clearedChecksData?.parsedData || [];
    let content = '';

    if (filename === 'cleared_checks.txt') {
      content = formatClearedCheckFile(parsedData);
    } else if (filename === 'cleared_checks_updates.sql') {
      content = '-- SQL update statements for the cleared checks would go here.';
    } else {
      content = `--- ${filename} ---\n\nThis file is generated from the data you provided in the previous step.\n\n`;
      content += JSON.stringify(parsedData, null, 2);
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Output Generation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your test data files are ready. Download them below.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Download Files</h4>
          <div className="space-y-3">
            {generatedFiles.map((filename) => (
              <div key={filename} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{filename}</span>
                <Button variant="secondary" onClick={() => downloadFile(filename)}>
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold dark:text-white">Monitoring Query:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 dark:text-white p-4 rounded-md overflow-x-auto">
            {monitoringQuery}
          </pre>
        </div>
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button variant="primary" onClick={handleStartOver}>
          Start Over
        </Button>
      </div>
    </div>
  );
}