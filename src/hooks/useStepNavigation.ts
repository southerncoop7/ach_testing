import { useAppContext } from '@/lib/context/AppContext';

export function useStepNavigation() {
  const { state, dispatch } = useAppContext();
  const { currentStep } = state;

  const nextStep = () => {
    if (currentStep < 6) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep + 1 });
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: currentStep - 1 });
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 6) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }
  };

  const isStepComplete = (step: number): boolean => {
    // Basic validation logic - can be enhanced later
    switch (step) {
      case 1:
        return state.databaseConfig.name.length > 0;
      case 2:
        return state.schemaDefinition.tableName.length > 0 && state.schemaDefinition.columns.length > 0;
      case 3:
        return Object.keys(state.achFields).length > 0;
      case 4:
        return Object.keys(state.testCaseConfig).length > 0;
      case 5:
        return Object.keys(state.generatedData).length > 0;
      case 6:
        return Object.keys(state.outputFiles).length > 0;
      default:
        return false;
    }
  };

  return {
    currentStep,
    nextStep,
    previousStep,
    goToStep,
    isStepComplete,
  };
} 