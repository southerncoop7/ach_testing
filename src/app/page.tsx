'use client';

import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { useState } from 'react';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      setError('This field is required');
    } else {
      setError('');
      alert(`Submitted: ${inputValue}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ACH Payment Tester
          </h1>
          
          <div className="space-y-4">
            <Input
              label="Database Name"
              value={inputValue}
              onChange={setInputValue}
              placeholder="Enter database name"
              error={error}
            />
            
            <div className="flex space-x-3">
              <Button variant="primary" onClick={handleSubmit}>
                Submit
              </Button>
              <Button variant="secondary" onClick={() => setInputValue('')}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
