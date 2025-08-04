'use client';

import React, { useState, useEffect } from 'react';
import type { AppData } from '../../types/application';
import { Button, Select } from '@/components/ui';

/**
 * The required fields for the "Cleared Checks" output format.
 * These fields must be mapped to columns in the user-provided SQL schema.
 */
const CLEARED_CHECKS_FIELDS = [
  { key: 'bankAccountNumber', label: 'Bank Account Number' },
  { key: 'checkNumber', label: 'Check Number' },
  { key: 'amount', label: 'Amount' },
  { key: 'date', label: 'Date (MMDDYY)' },
];

/**
 * Props for the Step2SchemaDefinition component.
 */
interface Step2SchemaDefinitionProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

/**
 * Component for Step 2: Schema Definition.
 * This step allows the user to provide a database schema, either by uploading a SQL file
 * or by selecting a previously saved schema. If the "Cleared Checks" format is selected,
 * it also handles mapping the required fields to the schema columns.
 */
export default function Step2SchemaDefinition({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step2SchemaDefinitionProps) {
  // State for form validation errors.
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // State to indicate if a file is being processed.
  const [isLoading, setIsLoading] = useState(false);
  // State to show messages to the user (e.g., "Schema saved").
  const [saveMessage, setSaveMessage] = useState('');
  // State to hold the mapping between Cleared Checks fields and SQL columns.
  const [mapping, setMapping] = useState<{ [sqlField: string]: string }>({});
  // State to control the visibility of the field mapping UI.
  const [showMappingUI, setShowMappingUI] = useState(false);
  // State to hold the extracted field definitions from the SQL schema.
  const [fieldDefs, setFieldDefs] = useState<Array<{ name: string; type: string }>>([]);
  // State to hold the list of schemas saved in local storage.
  const [savedSchemas, setSavedSchemas] = useState<{ key: string; name: string }[]>([]);
  // State to track the currently selected saved schema.
  const [selectedSchemaKey, setSelectedSchemaKey] = useState<string>('');
  // State to manage confirmation dialogs for deleting schemas.
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  // State to manage confirmation dialogs for overwriting schemas.
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState<string | null>(null);
  // State for mapping validation errors.
  const [mappingError, setMappingError] = useState('');

  /**
   * `useEffect` hook to load saved schemas from local storage on component mount.
   */
  useEffect(() => {
    const schemas: { key: string; name: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('schema_') && !key.startsWith('schema_struct_') && !key.startsWith('schema_map_')) {
        schemas.push({ key, name: key.replace('schema_', '') });
      } 
    }
    setSavedSchemas(schemas);
  }, []);

  /**
   * Extracts the table name from a `CREATE TABLE` SQL statement.
   * @param {string} sql - The SQL content.
   * @returns {string | null} The extracted table name or null if not found.
   */
  function extractTableName(sql: string): string | null {
    const match = sql.match(/CREATE\s+TABLE\s+(?:["'`]?\w-["'`]?\.)?["'`]?(\w+)["'`]?(?=\s*\()/i);
    return match ? match[1] : null;
  }

  /**
   * Extracts column definitions (name and type) from a `CREATE TABLE` SQL statement.
   * @param {string} sql - The SQL content.
   * @returns {Array<{ name: string; type: string }>} An array of column definitions.
   */
  function extractFieldDefs(sql: string): Array<{ name: string; type: string }> {
    const createTableMatch = sql.match(/CREATE\s+TABLE\s+[\s\S]*?\(/i);
    if (!createTableMatch) return [];
    let startIdx = createTableMatch.index! + createTableMatch[0].length - 1;
    let depth = 1;
    let endIdx = startIdx;
    while (endIdx < sql.length && depth > 0) {
      endIdx++;
      if (sql[endIdx] === '(') depth++;
      else if (sql[endIdx] === ')') depth--;
    }
    if (depth !== 0) return [];
    const fieldsBlock = sql.slice(startIdx + 1, endIdx).trim();

    const fields: string[] = [];
    let field = '';
    let parenDepth = 0;
    let inQuotes = false;
    for (let i = 0; i < fieldsBlock.length; i++) {
      const char = fieldsBlock[i];
      if (char === '"') inQuotes = !inQuotes;
      if (!inQuotes) {
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;
        if (char === ',' && parenDepth === 0) {
          fields.push(field.trim());
          field = '';
          continue;
        }
      }
      field += char;
    }
    if (field.trim()) fields.push(field.trim());

    const columns = fields
      .map(line => {
        const clean = line.trim().replace(/,$/, '');
        if (/^(CONSTRAINT|PRIMARY|FOREIGN|UNIQUE|KEY|CHECK|INDEX|REFERENCES)\b/i.test(clean)) return null;
        const match = clean.match(/^"([^"]+)"\s+([A-Z0-9_]+(?:\([^\)]*\))?)/i) || clean.match(/^([A-Z0-9_]+)\s+([A-Z0-9_]+(?:\([^\)]*\))?)/i);
        if (!match) return null;
        let name = match[1];
        let type = match[2];
        return { name, type };
      })
      .filter(Boolean) as Array<{ name: string; type: string }>;
    return columns;
  }

  /**
   * Handles the selection of a saved schema from the dropdown.
   * @param {string} value - The key of the selected schema.
   */
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

  /**
   * Handles the deletion of a saved schema.
   * @param {string} key - The key of the schema to delete.
   */
  const handleDeleteSchema = (key: string) => {
    localStorage.removeItem(key);
    localStorage.removeItem(`schema_struct_${key.replace('schema_', '')}`);
    localStorage.removeItem(`schema_map_${key.replace('schema_', '')}`);
    setSavedSchemas(prev => prev.filter(s => s.key !== key));
    if (selectedSchemaKey === key) {
      setSelectedSchemaKey('');
      onUpdate('schemaDefinition', { ...data.schemaDefinition, schema: null });
    }
    setShowDeleteConfirm(null);
  };

  /**
   * Handles the confirmation to overwrite an existing schema.
   */
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

  /**
   * Handles the file upload event for the SQL schema.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
   */
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
          localStorage.setItem(key, content);
          setSavedSchemas(prev => [...prev, { key, name: tableName }]);
          setSelectedSchemaKey(key);
          onUpdate('schemaDefinition', {
            ...data.schemaDefinition,
            schema: { fileName: file.name, content },
            method: 'upload',
          });
          setSaveMessage(`Schema saved locally as 'schema_${tableName}'.`);
          handleSchemaSelected(content, tableName, true);
        } else {
          setSaveMessage('Could not extract table name. Schema not saved.');
        }
        setIsLoading(false);
      };
      reader.readAsText(file);
    }
  };

  /**
   * Handles changes to the field mapping for Cleared Checks.
   * @param {string} clearedKey - The key of the Cleared Checks field.
   * @param {string} sqlField - The name of the SQL field to map to.
   */
  const handleMappingChange = (clearedKey: string, sqlField: string) => {
    setMapping(prev => ({ ...prev, [clearedKey]: sqlField }));
  };

  /**
   * Saves the field mapping to local storage.
   */
  const handleSaveMapping = () => {
    const tableName = extractTableName(data.schemaDefinition.schema?.content || '') || '';
    const allMapped = CLEARED_CHECKS_FIELDS.every(f => mapping[f.key] && mapping[f.key].trim() !== '');
    if (!allMapped) {
      setMappingError('Please map all required Cleared Checks fields.');
      return;
    }
    localStorage.setItem(`schema_map_${tableName}`, JSON.stringify(mapping));
    setShowMappingUI(false);
    setMappingError('');
  };

  /**
   * Handles the logic after a schema is selected or uploaded.
   * @param {string} schemaContent - The content of the SQL schema.
   * @param {string} tableName - The name of the table in the schema.
   * @param {boolean} [forceMapping=false] - Whether to force the mapping UI to be shown.
   */
  function handleSchemaSelected(schemaContent: string, tableName: string, forceMapping = false) {
    const fields = extractFieldDefs(schemaContent);
    setFieldDefs(fields);
    localStorage.setItem(`schema_struct_${tableName}`, JSON.stringify(fields));

    const mappingKey = `schema_map_${tableName}`;
    const savedMapping = localStorage.getItem(mappingKey);
    if (!savedMapping || forceMapping) {
      setShowMappingUI(true);
      const autoMap: { [key: string]: string } = {};
      CLEARED_CHECKS_FIELDS.forEach(req => {
        const match = fields.find(f => f.name.toLowerCase().includes(req.key.toLowerCase()));
        if (match) autoMap[req.key] = match.name;
      });
      setMapping(autoMap);
    } else {
      setMapping(JSON.parse(savedMapping));
      setShowMappingUI(false);
    }
  }

  /**
   * Handles the click event for the "Next" button.
   */
  const handleNext = () => {
    if (data.databaseConfig.outputFormat === 'cleared-checks') {
      if (!data.schemaDefinition.schema) {
        setErrors({ schema: 'Please upload or select a schema file.' });
        return;
      }
      if (showMappingUI) {
        setMappingError('Please save the field mapping before proceeding.');
        return;
      }
    }
    onNext();
  };

  const plausibleFieldDefs = fieldDefs.filter(f =>
    /account|check|amount|date/i.test(f.name)
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Schema Definition
        </h2>
        <p className="text-gray-600">
          {data.databaseConfig.outputFormat === 'cleared-checks'
            ? 'Upload or select a SQL schema for Cleared Checks.'
            : 'This step is optional for the selected output format.'}
        </p>
      </div>

      {data.databaseConfig.outputFormat === 'cleared-checks' ? (
        <div className="space-y-6">
          {savedSchemas.length > 0 && (
            <div className="mb-4">
              <Select
                label="Select a Saved Schema"
                value={selectedSchemaKey}
                onChange={handleSavedSchemaChange}
                options={[
                  { value: '', label: '-- Or select a saved schema --' },
                  ...savedSchemas.map(s => ({ value: s.key, label: s.name }))
                ]}
              />
              {selectedSchemaKey && (
                 <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowDeleteConfirm(selectedSchemaKey)}
                  >
                    Delete Selected Schema
                  </Button>
              )}
               {showDeleteConfirm && (
                  <div className="mt-2 text-sm">
                    <span>Delete this schema?&nbsp;</span>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteSchema(showDeleteConfirm)}>Yes, Delete</Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(null)}>No</Button>
                  </div>
                )}
            </div>
          )}

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
            {saveMessage && <p className="mt-2 text-sm text-green-600">{saveMessage}</p>}
            {data.schemaDefinition.schema && !isLoading && (
              <p className="mt-2 text-sm text-green-600">
                ✓ File uploaded: {data.schemaDefinition.schema.fileName}
              </p>
            )}
            {errors.schema && <p className="mt-2 text-sm text-red-600">{errors.schema}</p>}
          </div>

          {showOverwriteConfirm && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <span className="text-yellow-900 text-sm">
                A schema with this table name already exists. Overwrite?
              </span>
              <div className="mt-2 flex space-x-2">
                <Button variant="primary" onClick={handleConfirmOverwrite}>Yes, Overwrite</Button>
                <Button variant="secondary" onClick={() => setShowOverwriteConfirm(null)}>No, Cancel</Button>
              </div>
            </div>
          )}

          {showMappingUI && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">Map Cleared Checks Fields to SQL Fields</h4>
              <p className="text-sm text-yellow-800 mb-2">Please map each required Cleared Checks field to a SQL field from your schema:</p>
              <div className="space-y-2">
                {CLEARED_CHECKS_FIELDS.map(f => (
                  <div key={f.key} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900 w-40">{f.label}</span>
                    <select
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                      value={mapping[f.key] || ''}
                      onChange={e => handleMappingChange(f.key, e.target.value)}
                    >
                      <option value="">-- Select SQL Field --</option>
                      {plausibleFieldDefs.map(fd => (
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

          {!showMappingUI && fieldDefs.length > 0 && Object.keys(mapping).length > 0 && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Mapped Fields</h4>
              <ul className="text-sm text-gray-800 space-y-1">
                {CLEARED_CHECKS_FIELDS.map(f => {
                  const sqlField = mapping[f.key];
                  const field = fieldDefs.find(fieldDef => fieldDef.name === sqlField);
                  return sqlField && field ? (
                    <li key={f.key}>
                      <span className="font-semibold">{f.label}:</span> {sqlField} <span className="text-gray-500">({field.type})</span>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-600">
          No schema definition is required for the '{data.databaseConfig.outputFormat}' output format.
        </div>
      )}

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={isLoading || (data.databaseConfig.outputFormat === 'cleared-checks' && (showMappingUI || !data.schemaDefinition.schema))}
        >
          Next: ACH Fields
        </Button>
      </div>
    </div>
  );
}