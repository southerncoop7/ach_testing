'use client';

import { useState, useEffect } from 'react';
import type { AppData } from '../../types/application';
import { Button, Input, Select } from '@/components/ui';

interface Step1FileSelectionProps {
  data: AppData;
  onUpdate: (key: string, value: unknown) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}

export default function Step1FileSelection({
  data,
  onUpdate,
  onNext,
  onPrevious
}: Step1FileSelectionProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [newTableName, setNewTableName] = useState('');
  const [showAddTable, setShowAddTable] = useState(false);

  useEffect(() => {
    const savedTables = localStorage.getItem('tableNames');
    if (savedTables) {
      setTableNames(JSON.parse(savedTables));
    }
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!data.databaseConfig.tableName) {
      newErrors.tableName = 'Table name is required';
    }
    if (!data.databaseConfig.outputFormat) {
      newErrors.outputFormat = 'File type is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const handleFieldChange = (field: keyof AppData['databaseConfig'], value: string) => {
    onUpdate('databaseConfig', {
      ...data.databaseConfig,
      [field]: value
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTable = () => {
    if (newTableName && !tableNames.includes(newTableName)) {
      const updatedTables = [...tableNames, newTableName];
      setTableNames(updatedTables);
      localStorage.setItem('tableNames', JSON.stringify(updatedTables));
      handleFieldChange('tableName', newTableName);
      setNewTableName('');
      setShowAddTable(false);
    }
  };

  const handleDeleteTable = () => {
    if (data.databaseConfig.tableName) {
      const updatedTables = tableNames.filter(name => name !== data.databaseConfig.tableName);
      setTableNames(updatedTables);
      localStorage.setItem('tableNames', JSON.stringify(updatedTables));
      handleFieldChange('tableName', '');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          File Selection
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select your database and the type of file you want to generate.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-end space-x-2">
          <div className="flex-grow">
            <Select
              label="Table Name"
              value={data.databaseConfig.tableName}
              onChange={(value) => handleFieldChange('tableName', value)}
              options={tableNames.map(name => ({ value: name, label: name }))}
              error={errors.tableName}
              placeholder="Select a table"
            />
          </div>
          <Button variant="secondary" onClick={() => setShowAddTable(!showAddTable)} className="px-4">
            +
          </Button>
          <Button variant="danger" onClick={handleDeleteTable} className="px-4">
            -
          </Button>
        </div>

        {showAddTable && (
          <div className="flex items-center space-x-2 pl-1">
            <Input
              value={newTableName}
              onChange={setNewTableName}
              placeholder="Enter new table name"
            />
            <Button onClick={handleAddTable}>Add</Button>
          </div>
        )}

        <Select
          label="File Type"
          value={data.databaseConfig.outputFormat}
          onChange={(value) => handleFieldChange('outputFormat', value)}
          options={[
            { value: 'ach', label: 'ACH' },
            { value: 'ach-return', label: 'ACH Return' },
            { value: 'cleared-check', label: 'Cleared Check' },
            { value: 'origination-reject', label: 'Origination Reject' },
          ]}
          error={errors.outputFormat}
        />
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={true}
        >
          Previous
        </Button>
        
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!data.databaseConfig.tableName || !data.databaseConfig.outputFormat}
        >
          Next: {data.databaseConfig.outputFormat === 'ach' || data.databaseConfig.outputFormat === 'cleared-check' ? 'Schema Definition' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
}
