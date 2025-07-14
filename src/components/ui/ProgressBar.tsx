import React from 'react';

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  // Ensure we have valid numbers and clamp them
  const validCurrentStep = Math.max(1, Math.min(currentStep, totalSteps));
  const validTotalSteps = Math.max(1, totalSteps);
  const percentage = Math.min((validCurrentStep / validTotalSteps) * 100, 100);

  // Debug logging
  console.log('ProgressBar Debug:', { currentStep, totalSteps, validCurrentStep, validTotalSteps, percentage });

  return (
    <div className="w-full">
      <div className="flex justify-end text-sm text-gray-600 mb-2">
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-[#249E6B] h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 