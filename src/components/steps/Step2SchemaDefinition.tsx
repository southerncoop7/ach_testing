'use client';

import { Button } from '@/components/ui';
import { Select } from '@/components/ui';
import React, { useState } from 'react';

import type { AppData } from '../../types/application';

// Add required fields for Cleared Checks
const CLEARED_CHECKS_FIELDS = [
  { key: 'bankAccountNumber', label: 'Bank Account Number' },
  { key: 'checkNumber', label: 'Check Number' },
  { key: 'amount', label: 'Amount' },
  { key: 'date', label: 'Date (MMDDYY)' },
];

interface Step2SchemaDefinitionProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

export default function Step2SchemaDefinition({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step2SchemaDefinitionProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveSchema, setSaveSchema] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [fieldMapping, setFieldMapping] = useState<{ [key: string]: string }>({});
  const [showMapping, setShowMapping] = useState(false);
  const [sqlFields, setSqlFields] = useState<string[]>([]);

  // Helper to extract table name from SQL
  function extractTableName(sql: string): string | null {
    // Match CREATE TABLE <name> ( ... ) [;] (semicolon optional, allow incomplete)
    const match = sql.match(/CREATE\s+TABLE\s+[`'\"]?([\w-]+)[`'\"]?\s*\(/i);
    return match ? match[1] : null;
  }

  // Helper to extract field names from CREATE TABLE (even if incomplete)
  function extractFieldNames(sql: string): string[] {
    // Find the first CREATE TABLE ... ( ... )
    const match = sql.match(/CREATE\s+TABLE\s+[`'\"]?[\w-]+[`'\"]?\s*\(([^)]*)/i);
    if (!match) return [];
    const fieldsBlock = match[1];
    // Split by comma, get first word (field name)
    return fieldsBlock
      .split(',')
      .map(line => line.trim().split(/\s+/)[0].replace(/[`'\"]/g, ''))
      .filter(Boolean);
  }

  // Check if all required fields are present in SQL fields
  function getMissingClearedChecksFields(sqlFields: string[], mapping: { [key: string]: string }) {
    return CLEARED_CHECKS_FIELDS.filter(f => !Object.values(mapping).includes(f.key) && !sqlFields.includes(f.key));
  }

  const handleMethodChange = (value: string) => {
    onUpdate('schemaDefinition', {
      ...data.schemaDefinition,
      method: value
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setSaveMessage('');
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onUpdate('schemaDefinition', {
          ...data.schemaDefinition,
          schema: { fileName: file.name, content }
        });
        // If Cleared Checks, check for required fields
        if (data.databaseConfig?.outputFormat === 'cleared-checks') {
          const fields = extractFieldNames(content);
          setSqlFields(fields);
          // Try to auto-map by name
          const autoMap: { [key: string]: string } = {};
          CLEARED_CHECKS_FIELDS.forEach(f => {
            const found = fields.find(sf => sf.toLowerCase().includes(f.key.toLowerCase()));
            if (found) autoMap[found] = f.key;
          });
          setFieldMapping(autoMap);
          const missing = getMissingClearedChecksFields(fields, autoMap);
          if (missing.length > 0) {
            setShowMapping(true);
          } else {
            setShowMapping(false);
          }
        }
        if (saveSchema) {
          const tableName = extractTableName(content);
          if (tableName) {
            localStorage.setItem(`schema_${tableName}`, content);
            setSaveMessage(`Schema saved locally as 'schema_${tableName}'.`);
          } else {
            setSaveMessage('Could not extract table name. Schema not saved.');
          }
        }
        setIsLoading(false);
      };
      reader.readAsText(file);
    }
  };

  // Handle mapping changes
  const handleMappingChange = (sqlField: string, mappedKey: string) => {
    setFieldMapping(prev => ({ ...prev, [sqlField]: mappedKey }));
  };

  // Save mapping locally
  const handleSaveMapping = () => {
    if (sqlFields.length && Object.keys(fieldMapping).length >= CLEARED_CHECKS_FIELDS.length) {
      localStorage.setItem('clearedChecksFieldMapping', JSON.stringify(fieldMapping));
      setShowMapping(false);
      setSaveMessage('Field mapping saved locally.');
    } else {
      setSaveMessage('Please map all required fields.');
    }
  };

  const handleNext = () => {
    if (data.schemaDefinition.method === 'upload' && !data.schemaDefinition.schema) {
      setErrors({ schema: 'Please upload a schema file' });
      return;
    }
    onNext();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Schema Definition
        </h2>
        <p className="text-gray-600">
          Choose how to define your database schema for ACH payment data.
        </p>
      </div>

      <div className="space-y-6">
        <Select
          label="Schema Method"
          value={data.schemaDefinition.method}
          onChange={handleMethodChange}
          options={[
            { value: 'upload', label: 'Upload SQL Schema File' },
            { value: 'manual', label: 'Manual Schema Entry' }
          ]}
        />

        {data.schemaDefinition.method === 'upload' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload SQL Schema File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".sql"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="schema-file"
                  disabled={isLoading}
                />
                <label htmlFor="schema-file" className={`cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}` }>
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2">Click to upload SQL schema file</p>
                    <p className="text-xs text-gray-500">Supports .sql files</p>
                  </div>
                </label>
                {isLoading && (
                  <div className="mt-4 flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <span className="text-blue-600 text-sm">Processing file...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center mt-4">
                <input
                  id="save-schema"
                  type="checkbox"
                  checked={saveSchema}
                  onChange={e => setSaveSchema(e.target.checked)}
                  className="mr-2 h-4 w-4 text-[#004F71] border-gray-300 rounded focus:ring-[#004F71]"
                  disabled={isLoading}
                />
                <label htmlFor="save-schema" className="text-sm text-[#004F71] select-none">
                  Save uploaded schema locally for future use
                </label>
              </div>
              {saveMessage && (
                <p className="mt-2 text-sm text-green-600">{saveMessage}</p>
              )}
              {data.schemaDefinition.schema && !isLoading && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ File uploaded: {data.schemaDefinition.schema.fileName}
                </p>
              )}
              {errors.schema && (
                <p className="mt-2 text-sm text-red-600">{errors.schema}</p>
              )}
            </div>
          </div>
        )}

        {data.schemaDefinition.method === 'manual' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-900 mb-2">Manual Schema Entry</h3>
              <p className="text-sm text-yellow-800">
                Manual schema entry will be implemented in the next iteration. For now, please use the upload option.
              </p>
            </div>
          </div>
        )}

        {showMapping && (
          <div className="mt-4 border-2 border-[#004F71] rounded-lg p-4 bg-white">
            <h3 className="text-sm font-semibold text-[#004F71] mb-2">Map SQL Columns to Cleared Checks Fields</h3>
            <p className="text-sm text-[#004F71] mb-2">Some required fields were not found. Please map your SQL columns to the required Cleared Checks fields below:</p>
            <div className="space-y-2">
              {(sqlFields.length > 0 ? sqlFields : CLEARED_CHECKS_FIELDS.map(f => f.key)).map(sqlField => (
                <div key={sqlField} className="flex items-center space-x-2">
                  <span className="text-sm text-[#004F71] w-40">{sqlField}</span>
                  <select
                    className="border border-[#004F71] rounded px-2 py-1 text-sm text-[#004F71] focus:ring-[#004F71] focus:border-[#004F71]"
                    value={fieldMapping[sqlField] || ''}
                    onChange={e => handleMappingChange(sqlField, e.target.value)}
                  >
                    <option value="">-- Map to --</option>
                    {CLEARED_CHECKS_FIELDS.map(f => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <Button className="mt-4" variant="primary" onClick={handleSaveMapping}>Save Mapping</Button>
            {saveMessage && <p className="mt-2 text-sm text-green-600">{saveMessage}</p>}
          </div>
        )}

        <div className="bg-[#E6F1F5] border border-[#B3D6E6] rounded-lg p-4">
          <h3 className="text-sm font-medium text-[#004F71] mb-2">Schema Requirements:</h3>
          <ul className="text-sm text-[#004F71] space-y-1">
            <li>• Must contain CREATE TABLE statements</li>
            <li>• Should include fields for ACH payment data</li>
            <li>• Supported formats: SQL files (.sql)</li>
            <li>• File size limit: 1MB</li>
            <li>• Only the CREATE TABLE and field names are needed (with or without a semicolon at the end)</li>
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
          disabled={(data.schemaDefinition.method === 'upload' && (!data.schemaDefinition.schema || isLoading)) || isLoading}
        >
          Next: Test Data
        </Button>
      </div>
    </div>
  );
} 