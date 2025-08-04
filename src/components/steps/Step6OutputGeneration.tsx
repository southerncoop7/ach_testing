'use client';

import { useState } from 'react';
import type { AppData } from '../../types/application';
import { Button } from '@/components/ui';

/**
 * Props for the Step6OutputGeneration component.
 */
interface Step6OutputGenerationProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

/**
 * Component for Step 6: Output Generation.
 * This final step generates and allows the user to download the test data files
 * in the format they selected (SQL, fixed-width, NACHA, or Cleared Checks).
 */
export default function Step6OutputGeneration({
  data,
  onUpdate,
  onPrevious
}: Step6OutputGenerationProps) {
  // State to track if file generation is in progress.
  const [isGenerating, setIsGenerating] = useState(false);
  // State to hold the names of the generated files.
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);

  /**
   * Simulates the generation of output file names based on the selected format.
   */
  const generateOutputFiles = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const files = [];
      const format = data.databaseConfig.outputFormat;
      
      if (format === 'sql') {
        files.push(`${data.databaseConfig.databaseName || 'test_data'}.sql`);
      } else if (format === 'fixed-width') {
        files.push('ach_data.txt');
      } else if (format === 'nacha') {
        files.push('nacha_file.ach');
      } else if (format === 'cleared-checks') {
        files.push('cleared_checks.txt');
        files.push('cleared_checks.sql');
      }
      
      setGeneratedFiles(files);
      onUpdate('outputFiles', { files, generatedAt: new Date().toISOString() });
      setIsGenerating(false);
    }, 1000); // Simulate 1 second delay
  };

  /**
   * Generates the content for a given filename and triggers a download.
   * @param {string} filename - The name of the file to download.
   */
  const downloadFile = (filename: string) => {
    let content = '';
    const records = data.generatedData?.records || [];

    // Helper functions for formatting data.
    const padLeft = (val: string | number, len: number) => val.toString().padStart(len, '0');
    const formatAmount = (val: string | number) => padLeft(Math.round(Number(val) * 100), 10);
    const formatDate = (val: string) => {
      if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) return '010125'; // Default date
      const [year, month, day] = val.split('-');
      return `${month}${day}${year.slice(-2)}`;
    };

    // Generate content based on file type.
    if (filename.endsWith('.sql')) {
      if (data.databaseConfig.outputFormat === 'cleared-checks') {
        const tableName = data.schemaDefinition.schema?.fileName.replace('.sql', '') || 'cleared_checks';
        content = `-- Cleared Checks SQL Inserts for table: ${tableName}\n`;
        content += `INSERT INTO ${tableName} (bank_account_number, check_number, amount, date) VALUES\n`;
        content += records.map(r => 
          `('${r.bankAccountNumber}', '${r.checkNumber}', ${Number(r.amount)}, '${r.date}')`
        ).join(',\n') + ';';
      } else {
        content = `-- ACH Test Data SQL Inserts\n`;
        content += `INSERT INTO ach_payments (routing_number, account_number, amount, description, transaction_date, status) VALUES\n`;
        content += records.map(r => 
          `('${r.routingNumber}', '${r.accountNumber}', ${r.amount}, '${r.description}', '${r.transactionDate}', '${r.status}')`
        ).join(',\n') + ';';
      }
    } else if (filename.endsWith('.txt')) {
      if (data.databaseConfig.outputFormat === 'cleared-checks') {
        content = records.map(r => 
          `${padLeft(r.bankAccountNumber, 13)}${padLeft(r.checkNumber, 10)}${formatAmount(r.amount)}${r.date}`
        ).join('\r\n');
      } else { // Standard fixed-width
        content = records.map(r => 
          `${r.routingNumber.padEnd(9)}${r.accountNumber.padEnd(17)}${formatAmount(r.amount)}${(r.description || '').padEnd(80)}`
        ).join('\r\n');
      }
    } else if (filename.endsWith('.ach')) { // NACHA format
      // This is a simplified, mock NACHA file header. A real implementation would be much more complex.
      content = `101 ${data.achFields.routingNumber} ${data.achFields.routingNumber}${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${new Date().toISOString().slice(11, 17).replace(/:/g, '')}A094101${data.databaseConfig.databaseName.padEnd(23)}`;
    }
    
    // Create a Blob and trigger the download.
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

  /**
   * Clears all saved data from local storage and reloads the application to start over.
   */
  const handleStartOver = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Output Generation
        </h2>
        <p className="text-gray-600">
          Your test data files are ready. Download them below.
        </p>
      </div>

      <div className="space-y-6">
        {!generatedFiles.length && (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Your Output Files</h3>
            <p className="text-gray-600 mb-6">
              Click the button to generate files in the {data.databaseConfig.outputFormat.toUpperCase()} format.
            </p>
            <Button
              variant="primary"
              onClick={generateOutputFiles}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Output Files'}
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating output files...</p>
          </div>
        )}

        {generatedFiles.length > 0 && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-900 mb-2">
                ✓ Files Generated Successfully
              </h3>
              <p className="text-sm text-green-800">
                Your test data files are ready for download.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Download Files</h4>
              <div className="space-y-3">
                {generatedFiles.map((filename) => (
                  <div key={filename} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">{filename}</span>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => downloadFile(filename)}
                    >
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        
        <div className="flex space-x-3">
          {generatedFiles.length > 0 && (
            <Button
              variant="secondary"
              onClick={generateOutputFiles}
              disabled={isGenerating}
            >
              Regenerate Files
            </Button>
          )}
          
          <Button
            variant="primary"
            onClick={handleStartOver}
          >
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}