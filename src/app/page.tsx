'use client';

import { useState, useEffect } from 'react';
import type { AppData } from '../types/application';

// UI components for the page layout and step navigation
import { StepIndicator } from '@/components/ui';
import { ProgressBar } from '@/components/ui';

// Import all the components for each step in the process
import Step1DatabaseConfig from '../components/steps/Step1DatabaseConfig';
import Step2SchemaDefinition from '../components/steps/Step2SchemaDefinition';
import Step3ACHFields from '../components/steps/Step3ACHFields';
import Step4TestCaseConfig from '../components/steps/Step4TestCaseConfig';
import Step5DataGeneration from '../components/steps/Step5DataGeneration';
import Step6OutputGeneration from '../components/steps/Step6OutputGeneration';

/**
 * An array defining the steps of the application.
 * Each object contains an id, title, and description for a step.
 */
const STEPS = [
  { id: 1, title: 'Database Config', description: 'Configure database settings' },
  { id: 2, title: 'Schema Definition', description: 'Define or upload schema' },
  { id: 3, title: 'ACH Fields', description: 'Configure ACH payment fields' },
  { id: 4, title: 'Test Cases', description: 'Set up test scenarios' },
  { id: 5, title: 'Data Generation', description: 'Generate test data' },
  { id: 6, title: 'Output', description: 'Download generated files' }
];

/**
 * The main component for the home page.
 * It manages the state and logic for the multi-step form.
 */
export default function Home() {
  // State to track the current active step
  const [currentStep, setCurrentStep] = useState(1);
  // State to track which steps have been completed
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  // State to hold any error messages
  const [error, setError] = useState<string | null>(null);
  // State to hold all the application data collected across the steps
  const [appData, setAppData] = useState<AppData>({
    databaseConfig: { databaseName: '', outputFormat: 'sql' },
    schemaDefinition: { method: 'upload', schema: null },
    achFields: { routingNumber: '', accountNumber: '', amount: '', description: '' },
    clearedChecksFields: { bankAccountNumber: '', checkNumber: '', amount: '', date: '' },
    testCaseConfig: { testCaseType: 'basic', recordCount: 100 },
    generatedData: null,
    outputFiles: null
  });

  /**
   * `useEffect` hook to load saved data from localStorage when the component mounts.
   * This allows the user to resume their session.
   */
  useEffect(() => {
    const savedData = localStorage.getItem('achPaymentTesterData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAppData(parsed.appData || appData);
        setCurrentStep(parsed.currentStep || 1);
        setCompletedSteps(parsed.completedSteps || []);
        setError(null);
      } catch (error) {
        console.error('Error loading saved data:', error);
        setError('Failed to load saved data. Starting fresh.');
      }
    }
  }, []);

  /**
   * `useEffect` hook to save the current state to localStorage whenever it changes.
   * This ensures the user's progress is not lost.
   */
  useEffect(() => {
    try {
      const dataToSave = {
        appData,
        currentStep,
        completedSteps
      };
      localStorage.setItem('achPaymentTesterData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Failed to save data. Please check your browser storage.');
    }
  }, [appData, currentStep, completedSteps]);

  /**
   * Updates a specific part of the application data state.
   * @param {string} key - The key of the appData object to update.
   * @param {unknown} value - The new value.
   */
  const updateAppData = (key: string, value: unknown) => {
    setAppData(prev => ({
      ...prev,
      [key]: value
    } as AppData));
  };

  /**
   * Marks a step as complete.
   * @param {number} step - The step number to mark as complete.
   */
  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  /**
   * Navigates to the next step in the process.
   */
  const nextStep = () => {
    if (currentStep < STEPS.length) {
      markStepComplete(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Navigates to the previous step in the process.
   */
  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Jumps to a specific step.
   * @param {number} step - The step number to navigate to.
   */
  const goToStep = (step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  };

  /**
   * Checks if a given step is complete.
   * @param {number} step - The step number to check.
   * @returns {boolean} - True if the step is complete, false otherwise.
   */
  const isStepComplete = (step: number) => {
    return completedSteps.includes(step);
  };

  /**
   * Renders the component for the current active step.
   * It also includes an error boundary to catch rendering errors in a step.
   * @returns {JSX.Element} The component for the current step.
   */
  const renderCurrentStep = () => {
    try {
      const commonProps = {
        data: appData,
        onUpdate: updateAppData,
        onNext: nextStep,
        onPrevious: previousStep,
        isComplete: isStepComplete(currentStep)
      };

      switch (currentStep) {
        case 1:
          return <Step1DatabaseConfig {...commonProps} />;
        case 2:
          return <Step2SchemaDefinition {...commonProps} />;
        case 3:
          return <Step3ACHFields {...commonProps} />;
        case 4:
          return <Step4TestCaseConfig {...commonProps} />;
        case 5:
          return <Step5DataGeneration {...commonProps} />;
        case 6:
          return <Step6OutputGeneration {...commonProps} />;
        default:
          return <div>Step not found</div>;
      }
    } catch (error) {
      console.error('Error rendering step:', error);
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading step {currentStep}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>An error occurred while loading this step. Please try refreshing the page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Tester
              </h1>
              <p className="text-sm text-gray-600">
                Generate payment test data and database insert statements
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <button
                type="button"
                className="px-4 py-2 rounded-[6px] font-semibold border border-[#004F71] text-[#004F71] bg-white hover:bg-[#004F71] hover:text-white transition-all duration-150 shadow-sm"
                onClick={() => {
                  localStorage.removeItem('achPaymentTesterData');
                  window.location.reload();
                }}
              >
                Start Over
              </button>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">Step {currentStep} of {STEPS.length}</div>
                <ProgressBar currentStep={currentStep} totalSteps={6} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicator Navigation Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </div>
      </div>

      {/* Global Error Display Area */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area where the current step is rendered */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}