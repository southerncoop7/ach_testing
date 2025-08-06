import React from 'react';

/**
 * Props for the ProgressBar component.
 */
type ProgressBarProps = {
  /** The current step number (1-based). */
  currentStep: number;
  /** The total number of steps. */
  totalSteps: number;
};

/**
 * A component that displays a progress bar.
 * It visualizes the user's progress through a multi-step process.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  // Ensure the inputs are valid numbers and clamp them to reasonable ranges.
  const validCurrentStep = Math.max(1, Math.min(currentStep, totalSteps));
  const validTotalSteps = Math.max(1, totalSteps);
  
  // Calculate the progress percentage.
  const percentage = Math.min((validCurrentStep / validTotalSteps) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-end text-sm text-gray-600 dark:text-gray-400 mb-1">
        {/* Display the rounded percentage */}
        <span>{Math.round(percentage)}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        {/* The colored part of the progress bar, its width is set by the percentage. */}
        <div
          className="bg-success h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;