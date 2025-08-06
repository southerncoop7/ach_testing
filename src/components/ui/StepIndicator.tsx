import React from 'react';

/**
 * Represents a single step in the indicator.
 */
type Step = {
  id: number;
  title: string;
  description: string;
};

/**
 * Props for the StepIndicator component.
 */
type StepIndicatorProps = {
  /** An array of step objects to display. */
  steps: Step[];
  /** The ID of the currently active step. */
  currentStep: number;
  /** An array of IDs of the steps that have been completed. */
  completedSteps: number[];
  /** The function to call when a step is clicked. */
  onStepClick: (step: number) => void;
};

/**
 * A component that displays a horizontal step indicator for a multi-step process.
 * It shows the user which step they are on, which steps are complete, and allows
 * them to navigate between steps.
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  // A special mapping to change the display title of a step if needed.
  const displaySteps = steps.map(step =>
    step.title === 'ACH Fields' ? { ...step, title: 'Test Data' } : step
  );

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between w-full py-4">
        {displaySteps.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.id} className="relative flex-1">
              {/* Render the connector line between steps */}
              {stepIdx !== 0 && (
                <div className="absolute inset-0 top-5 left-0 w-full h-0.5" aria-hidden="true">
                  <div className={`h-full w-full ${isCompleted || isCurrent ? 'bg-success' : 'bg-gray-400 dark:bg-gray-600'}`} />
                </div>
              )}

              <button
                onClick={() => onStepClick(step.id)}
                className="relative flex flex-col items-center w-full"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors z-10 ${
                      isCompleted
                        ? 'bg-success text-white'
                        : isCurrent
                        ? 'bg-primary text-white ring-4 ring-primary/20'
                        : 'bg-gray-400 text-gray-600 hover:bg-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-sm font-bold ${
                      isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-gray-900 dark:text-gray-300'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;