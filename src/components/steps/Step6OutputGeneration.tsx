'use client';

import { Button } from '@/components/ui';
import { useState } from 'react';

import type { AppData } from '../../types/application';

interface Step6OutputGenerationProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

export default function Step6OutputGeneration({
  data,
  onUpdate,
  onPrevious
}: Step6OutputGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);

  const generateOutputFiles = () => {
    setIsGenerating(true);
    
    // Simulate file generation
    setTimeout(() => {
      const files = [];
      
      if (data.databaseConfig.outputFormat === 'sql') {
        files.push('ach_test_data.sql');
      } else if (data.databaseConfig.outputFormat === 'fixed-width') {
        files.push('ach_test_data.txt');
      } else if (data.databaseConfig.outputFormat === 'nacha') {
        files.push('ach_test_data.nacha');
      } else if (data.databaseConfig.outputFormat === 'cleared-checks') {
        files.push('clearedcheck.txt');
        files.push('clearedcheck.sql');
      }
      
      setGeneratedFiles(files);
      onUpdate('outputFiles', { files, generatedAt: new Date().toISOString() });
      setIsGenerating(false);
    }, 1500);
  };

  const downloadFile = (filename: string) => {
    let content = '';
    
    if (filename.endsWith('.sql')) {
      content = `-- ACH Test Data SQL Insert Statements\n-- Generated on ${new Date().toLocaleDateString()}\n-- Database: ${data.databaseConfig.databaseName}\n\nINSERT INTO ach_payments (routing_number, account_number, amount, description, transaction_date, status) VALUES\n('${data.achFields.routingNumber}', '${data.achFields.accountNumber}', ${data.achFields.amount}, '${data.achFields.description || 'Test Payment'}', '${new Date().toISOString().split('T')[0]}', 'pending');`;
    } else if (filename === 'clearedcheck.txt') {
      // Generate fixed width cleared checks file
      // Each row: 13 (account) + 10 (check) + 10 (amount) + 6 (date) + 2 spaces = 41
      // Use data.generatedData.records if available, else fallback to achFields
      const records = data.generatedData?.records || [
        {
          bankAccountNumber: data.achFields.accountNumber || '',
          checkNumber: '',
          amount: data.achFields.amount || '',
          date: '',
        },
      ];
      // Helper type guards
      function isClearedCheckRecord(r: any): r is { bankAccountNumber: string; checkNumber: string; amount: string; date: string } {
        return (
          typeof r.bankAccountNumber === 'string' &&
          typeof r.checkNumber === 'string' &&
          typeof r.amount === 'string' &&
          typeof r.date === 'string'
        );
      }
      function isACHRecord(r: any): r is { accountNumber: string; amount: string; transactionDate: string } {
        return (
          typeof r.accountNumber === 'string' &&
          typeof r.amount === 'string' &&
          typeof r.transactionDate === 'string'
        );
      }
      function padLeft(val: string | number, len: number) {
        return val.toString().padStart(len, '0');
      }
      function formatAmount(val: string | number) {
        const num = Math.round(Number(val) * 100);
        return padLeft(num, 10);
      }
      function formatDate(val: string) {
        if (!val) return '010100';
        const d = new Date(val);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(-2);
        return `${mm}${dd}${yy}`;
      }
      content = records.map(r => {
        let acct = '', check = '', amt = '', dt = '';
        if (isClearedCheckRecord(r)) {
          acct = padLeft(r.bankAccountNumber, 13);
          check = padLeft(r.checkNumber, 10);
          amt = formatAmount(r.amount);
          dt = formatDate(r.date);
        } else if (isACHRecord(r)) {
          acct = padLeft(r.accountNumber, 13);
          check = padLeft('', 10);
          amt = formatAmount(r.amount);
          dt = formatDate(r.transactionDate);
        }
        return `${acct}${check}${amt}${dt}  `;
      }).join('\r\n') + '\r\n\r\n'; // CRLF, blank line at end
    } else if (filename === 'clearedcheck.sql') {
      // Generate SQL insert for cleared checks
      // Table: cleared_checks (bank_account_number, check_number, amount, date)
      const records = data.generatedData?.records || [
        {
          bankAccountNumber: data.achFields.accountNumber || '',
          checkNumber: '',
          amount: data.achFields.amount || '',
          date: '',
        },
      ];
      // Helper type guards
      function isClearedCheckRecord(r: any): r is { bankAccountNumber: string; checkNumber: string; amount: string; date: string } {
        return (
          typeof r.bankAccountNumber === 'string' &&
          typeof r.checkNumber === 'string' &&
          typeof r.amount === 'string' &&
          typeof r.date === 'string'
        );
      }
      function isACHRecord(r: any): r is { accountNumber: string; amount: string; transactionDate: string } {
        return (
          typeof r.accountNumber === 'string' &&
          typeof r.amount === 'string' &&
          typeof r.transactionDate === 'string'
        );
      }
      content = `-- Cleared Checks SQL Insert\n-- Generated on ${new Date().toLocaleDateString()}\nINSERT INTO cleared_checks (bank_account_number, check_number, amount, date) VALUES\n`;
      content += records.map(r => {
        let acct = '', check = '', amt = '', dt = '';
        if (isClearedCheckRecord(r)) {
          acct = r.bankAccountNumber;
          check = r.checkNumber;
          amt = r.amount;
          dt = r.date;
        } else if (isACHRecord(r)) {
          acct = r.accountNumber;
          check = '';
          amt = r.amount;
          dt = r.transactionDate;
        }
        return `('${acct}', '${check}', ${Number(amt) || 0}, '${dt}')`;
      }).join(',\n') + ';';
    } else if (filename.endsWith('.txt')) {
      content = `${data.achFields.routingNumber.padEnd(9)}${data.achFields.accountNumber.padEnd(17)}${data.achFields.amount.padStart(10)}${(data.achFields.description || 'Test Payment').padEnd(80)}`;
    } else if (filename.endsWith('.nacha')) {
      content = `101 123456789 123456789${new Date().toISOString().slice(2, 8)}${new Date().toISOString().slice(11, 13)}${new Date().toISOString().slice(14, 16)}A094101123456789                          ${data.databaseConfig.databaseName}                    `;
    }
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
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
    // Clear localStorage and reset state
    localStorage.removeItem('achPaymentTesterData');
    window.location.reload();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Output Generation
        </h2>
        <p className="text-gray-600">
          Generate and download your ACH payment test data files.
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Output Files</h3>
            <p className="text-gray-600 mb-6">
              Generate {data.databaseConfig.outputFormat.toUpperCase()} format files for your ACH test data.
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
                ✓ Output Files Generated Successfully
              </h3>
              <p className="text-sm text-green-800">
                Your ACH test data files are ready for download.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Generated Files</h4>
              <div className="space-y-3">
                {generatedFiles.map((filename) => (
                  <div key={filename} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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

            <div className="bg-[#E6F1F5] border border-[#B3D6E6] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#004F71] mb-2">Next Steps:</h3>
              <ul className="text-sm text-[#004F71] space-y-1">
                <li>• Download the generated files</li>
                <li>• Import the data into your database or ACH processing system</li>
                <li>• Use the test data for your ACH payment testing scenarios</li>
                <li>• Verify the data format matches your system requirements</li>
              </ul>
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