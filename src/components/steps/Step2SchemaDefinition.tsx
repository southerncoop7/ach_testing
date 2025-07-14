// Step 2: Schema Definition
// This step allows the user to define the database schema by uploading a SQL file or entering it manually. Handles required field mapping for Cleared Checks.

'use client';

import { Button } from '@/components/ui';
import { Select } from '@/components/ui';
import React, { useState, useEffect } from 'react';

import type { AppData } from '../../types/application';

// Ensure CLEARED_CHECKS_FIELDS includes all 4 required fields
const CLEARED_CHECKS_FIELDS = [
  { key: 'bankAccountNumber', label: 'Bank Account Number' },
  { key: 'checkNumber', label: 'Check Number' },
  { key: 'amount', label: 'Amount' },
  { key: 'date', label: 'Date (MMDDYY)' },
];

// Helper to check if mapping is complete
function isMappingComplete(map: { [sqlField: string]: string }) {
  const mappedValues = Object.values(map);
  return CLEARED_CHECKS_FIELDS.every(f => mappedValues.includes(f.key));
}

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
  const [savedSchemas, setSavedSchemas] = useState<{ key: string; name: string }[]>([]);
  const [selectedSchemaKey, setSelectedSchemaKey] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState<string | null>(null);

  // Add state for current field definitions
  const [fieldDefs, setFieldDefs] = useState<Array<{ name: string; type: string }>>([]);
  const [mapping, setMapping] = useState<{ [sqlField: string]: string }>({});
  const [showMappingUI, setShowMappingUI] = useState(false);
  const [mappingError, setMappingError] = useState('');

  // On mount, load saved schemas from localStorage
  useEffect(() => {
    const schemas: { key: string; name: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith('schema_') &&
        !key.startsWith('schema_struct_') &&
        !key.startsWith('schema_map_')
      ) {
        schemas.push({ key, name: key.replace('schema_', '') });
      }
    }
    setSavedSchemas(schemas);
  }, []);

  // On mount, if a schema is already selected, load its fieldDefs
  useEffect(() => {
    if (selectedSchemaKey) {
      const schemaContent = localStorage.getItem(selectedSchemaKey);
      const tableName = selectedSchemaKey.replace('schema_', '');
      if (schemaContent) {
        const struct = localStorage.getItem(`schema_struct_${tableName}`);
        if (struct) {
          setFieldDefs(JSON.parse(struct));
        } else {
          // This case should ideally be handled by handleSchemaSelected, but as a fallback
          // If the struct is not found, try to parse and save it
          const fields = extractFieldDefs(schemaContent);
          setFieldDefs(fields);
          localStorage.setItem(`schema_struct_${tableName}`, JSON.stringify(fields));
        }
      }
    } else {
      setFieldDefs([]);
    }
  }, [selectedSchemaKey]);

  // Helper to extract table name from SQL for localStorage key
  function extractTableName(sql: string): string | null {
    // Match CREATE TABLE [schema.]table (with or without quotes)
    // Examples: CREATE TABLE tablename, CREATE TABLE "schema"."table", CREATE TABLE schema.table
    const match = sql.match(/CREATE\s+TABLE\s+(?:["'`]?\w+["'`]?\.)?["'`]?(\w+)["'`]?(?=\s*\()/i);
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

  // Helper to extract field names and types from CREATE TABLE
  function extractFieldDefs(sql: string): Array<{ name: string; type: string }> {
    // Find the first CREATE TABLE ... ( ... )
    const match = sql.match(/CREATE\s+TABLE\s+(?:["'`]?[\w]+["'`]?(?:\.["'`]?[\w]+["'`]?)?)\s*\(([^)]*)/i);
    if (!match) return [];
    const fieldsBlock = match[1];
    // Split by comma, ignore constraints (PRIMARY KEY, etc.)
    return fieldsBlock
      .split(',')
      .map(line => {
        const parts = line.trim().split(/\s+/);
        // Only consider lines that look like: name type ...
        if (parts.length < 2) return null;
        const name = parts[0].replace(/[`'"\[\]]/g, '');
        const type = parts[1].replace(/[`'"\[\]]/g, '');
        // Ignore constraint lines
        if (/^(PRIMARY|FOREIGN|UNIQUE|CONSTRAINT|KEY)$/i.test(name)) return null;
        return { name, type };
      })
      .filter(Boolean) as Array<{ name: string; type: string }>;
  }

  // Check if all required fields are present in SQL fields or mapping
  function getMissingClearedChecksFields(sqlFields: string[], mapping: { [key: string]: string }) {
    return CLEARED_CHECKS_FIELDS.filter(f => !Object.values(mapping).includes(f.key) && !sqlFields.includes(f.key));
  }

  // Handler for schema method select (upload/manual)
  const handleMethodChange = (value: string) => {
    onUpdate('schemaDefinition', {
      ...data.schemaDefinition,
      method: value
    });
  };

  // Handler for selecting a saved schema
  const handleSavedSchemaChange = (value: string) => {
    setSelectedSchemaKey(value);
    if (value) {
      const schemaContent = localStorage.getItem(value);
      if (schemaContent) {
        const tableName = value.replace('schema_', '');
        onUpdate('schemaDefinition', {
          ...data.schemaDefinition,
          schema: { fileName: tableName + '.sql', content: schemaContent },
          method: 'upload',
        });
        handleSchemaSelected(schemaContent, tableName);
      }
    }
  };

  // Handler for deleting a saved schema
  const handleDeleteSchema = (key: string) => {
    localStorage.removeItem(key);
    setSavedSchemas(prev => prev.filter(s => s.key !== key));
    if (selectedSchemaKey === key) {
      setSelectedSchemaKey('');
      onUpdate('schemaDefinition', { ...data.schemaDefinition, schema: null });
    }
    setShowDeleteConfirm(null);
  };

  // Handler for confirming overwrite
  const handleConfirmOverwrite = () => {
    if (showOverwriteConfirm) {
      const content = data.schemaDefinition.schema?.content || '';
      const tableName = extractTableName(content);
      if (tableName) {
        const key = `schema_${tableName}`;
        localStorage.setItem(key, content);
        setSavedSchemas(prev => prev.map(s => s.key === key ? { key, name: tableName } : s));
        setSelectedSchemaKey(key);
        setSaveMessage(`Schema '${tableName}' overwritten.`);
        setShowOverwriteConfirm(null);
        handleSchemaSelected(content, tableName, true); // force mapping UI
      }
    }
  };

  // Handler for file upload (with overwrite check)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setSaveMessage('');
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const tableName = extractTableName(content);
        if (tableName) {
          const key = `schema_${tableName}`;
          if (savedSchemas.some(s => s.key === key)) {
            setShowOverwriteConfirm(key);
            setIsLoading(false);
            return;
          }
          // Save new schema
          localStorage.setItem(key, content);
          setSavedSchemas(prev => [...prev, { key, name: tableName }]);
          setSelectedSchemaKey(key);
          onUpdate('schemaDefinition', {
            ...data.schemaDefinition,
            schema: { fileName: tableName + '.sql', content },
            method: 'upload',
          });
          setSaveMessage(`Schema saved locally as 'schema_${tableName}'.`);
          handleSchemaSelected(content, tableName, true); // force mapping UI
        } else {
          setSaveMessage('Could not extract table name. Schema not saved.');
        }
        setIsLoading(false);
      };
      reader.readAsText(file);
    }
  };

  // Handler for mapping changes in the Cleared Checks mapping UI
  // Update mapping logic: mapping is { [clearedChecksFieldKey]: sqlFieldName }
  const handleMappingChange = (clearedKey: string, sqlField: string) => {
    setMapping(prev => ({ ...prev, [clearedKey]: sqlField }));
  };

  // Handler to save mapping (now inside the component)
  const handleSaveMapping = () => {
    const tableName = extractTableName(data.schemaDefinition.schema?.content || '') || '';
    // All 4 required fields must be mapped to a non-empty SQL field
    const allMapped = CLEARED_CHECKS_FIELDS.every(f => mapping[f.key] && mapping[f.key].trim() !== '');
    if (!allMapped) {
      setMappingError('Please map all required Cleared Checks fields.');
      return;
    }
    localStorage.setItem(`schema_map_${tableName}`, JSON.stringify(mapping));
    setShowMappingUI(false);
    setMappingError('');
  };

  // Handler for Next button
  const handleNext = () => {
    if (data.schemaDefinition.method === 'upload' && !data.schemaDefinition.schema) {
      setErrors({ schema: 'Please upload a schema file' });
      return;
    }
    onNext();
  };

  // After schema upload or selection, parse and save field structure
  // When loading a saved mapping, ensure it is in the correct format
  function handleSchemaSelected(schemaContent: string, tableName: string, forceMapping = false) {
    const fields = extractFieldDefs(schemaContent);
    setFieldDefs(fields);
    // Check for existing mapping
    const mappingKey = `schema_map_${tableName}`;
    const savedMapping = localStorage.getItem(mappingKey);
    if (!savedMapping || forceMapping) {
      setShowMappingUI(true);
      // Try to auto-map by name
      const autoMap: { [key: string]: string } = {};
      CLEARED_CHECKS_FIELDS.forEach(req => {
        const match = fields.find(f => f.name.toLowerCase().includes(req.key.toLowerCase()));
        if (match) autoMap[req.key] = match.name;
      });
      setMapping(autoMap);
      return;
    } else {
      // Ensure mapping is { [clearedChecksFieldKey]: sqlFieldName }
      const loaded = JSON.parse(savedMapping);
      setMapping(loaded);
      setShowMappingUI(false);
    }
    // Save to localStorage for use in Step 6
    localStorage.setItem(`schema_struct_${tableName}`, JSON.stringify(fields));
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Schema Definition
        </h2>
        <p className="text-gray-600">
          Choose or upload a SQL schema for Cleared Checks.
        </p>
      </div>

      {data.databaseConfig.outputFormat === 'cleared-checks' && (
        <div className="space-y-6">
          {/* Saved Schemas Section */}
          {savedSchemas.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Saved Schemas</label>
              <Select
                label="Select Saved Schema"
                value={selectedSchemaKey}
                onChange={handleSavedSchemaChange}
                options={[
                  { value: '', label: '-- Select a saved schema --' },
                  ...savedSchemas.map(s => ({ value: s.key, label: s.name }))
                ]}
              />
              <div className="mt-2 space-y-1">
                {savedSchemas.map(s => (
                  <div key={s.key} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">{s.name}</span>
                    <Button
                      variant="secondary"
                      onClick={() => setShowDeleteConfirm(s.key)}
                    >
                      Delete
                    </Button>
                    {showDeleteConfirm === s.key && (
                      <span className="ml-2 text-sm">
                        Delete this schema?&nbsp;
                        <Button variant="primary" onClick={() => handleDeleteSchema(s.key)}>Yes</Button>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>No</Button>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File upload UI for schema */}
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

          {/* Overwrite confirmation dialog */}
          {showOverwriteConfirm && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <span className="text-yellow-900 text-sm">
                A schema with this table name already exists. Overwrite?
              </span>
              <div className="mt-2 flex space-x-2">
                <Button variant="primary" onClick={handleConfirmOverwrite}>Yes, Overwrite</Button>
                <Button variant="secondary" onClick={() => setShowOverwriteConfirm(null)}>No, Use Existing</Button>
              </div>
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
      )}
      {(
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">Map Cleared Checks Fields to SQL Fields</h4>
          <p className="text-sm text-yellow-800 mb-2">Please map each required Cleared Checks field to a SQL field from your schema:</p>
          <div className="space-y-2">
            {CLEARED_CHECKS_FIELDS.map(f => (
              <div key={f.key} className="flex items-center space-x-2">
                <span className="text-sm text-gray-900 w-40">{f.label}</span>
                <select
                  className="border border-[#004F71] rounded px-2 py-1 text-sm text-[#004F71] focus:ring-[#004F71] focus:border-[#004F71]"
                  value={mapping[f.key] || ''}
                  onChange={e => handleMappingChange(f.key, e.target.value)}
                >
                  <option value="">-- Select SQL Field --</option>
                  {fieldDefs.map(fd => (
                    <option key={fd.name} value={fd.name}>{fd.name} ({fd.type})</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {mappingError && <p className="mt-2 text-sm text-red-600">{mappingError}</p>}
          <Button className="mt-4" variant="primary" onClick={handleSaveMapping}>
            Save Mapping
          </Button>
        </div>
      )}
      {/* Only show mapped fields summary if mapping exists and mapping UI is not shown */}
      {!showMappingUI && fieldDefs.length > 0 && mapping && CLEARED_CHECKS_FIELDS.every(f => mapping[f.key]) ? (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Mapped Fields</h4>
          <ul className="text-sm text-gray-800 space-y-1">
            {CLEARED_CHECKS_FIELDS.map(f => {
              const sqlField = mapping[f.key];
              const field = fieldDefs.find(fieldDef => fieldDef.name === sqlField);
              return sqlField && field ? (
                <li key={f.key}>
                  <span className="font-mono">{f.label}</span> 
                  <span className="font-mono">{sqlField}</span> 
                  <span className="text-gray-500">({field.type})</span>
                </li>
              ) : null;
            })}
          </ul>
        </div>
      ) : null}

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={
            (data.schemaDefinition.method === 'upload' && (!data.schemaDefinition.schema || isLoading)) ||
            isLoading ||
            (data.databaseConfig.outputFormat === 'cleared-checks' && (showMappingUI || !isMappingComplete(mapping)))
          }
        >
          Next: Test Data
        </Button>
      </div>
    </div>
  );
}
// End of Step 2 