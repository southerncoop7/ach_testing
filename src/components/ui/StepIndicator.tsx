import React from 'react';

type Step = {
  id: number;
  title: string;
  description: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
};

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  // Map step titles, changing 'ACH Fields' to 'Test Data'
  const displaySteps = steps.map(step =>
    step.title === 'ACH Fields' ? { ...step, title: 'Test Data' } : step
  );
  return (
    <div className="flex items-center justify-between w-full py-4">
      {displaySteps.map((step) => {
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        
        return (
          <div key={step.id} className="flex flex-col items-center">
            <button
              onClick={() => onStepClick(step.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors mb-2 ${
                isCompleted
                  ? 'bg-[#249E6B] text-white'
                  : isCurrent
                  ? 'bg-[#004F71] text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isCompleted ? '✓' : step.id}
            </button>
            <div className="text-center">
              <div className={`text-xs font-bold ${
                isCurrent ? 'text-[#004F71]' : isCompleted ? 'text-[#249E6B]' : 'text-gray-900'
              }`}>
                {step.title}
              </div>
              <div className="text-xs font-bold text-gray-500 hidden sm:block">
                {step.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator; 