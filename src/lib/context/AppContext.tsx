'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { AppData, AppState, DatabaseConfig, SchemaDefinition, ACHFields, TestCaseConfig, GeneratedData, OutputFiles, ClearedChecksFields } from '@/types/application';

/**
 * NOTE: This context and reducer are set up for global state management but are not
 * currently used by the application. The primary state management is handled within
 * the `Home` component (`src/app/page.tsx`) using `useState` and `localStorage`.
 *
 * This file is being kept and commented for potential future use if state management
 * needs to be centralized. The types and initial state have been updated to be
 * consistent with the rest of the application as of the last review.
 */

/**
 * Defines the shape of the actions that can be dispatched to update the application state.
 */
type AppAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_DATABASE_CONFIG'; payload: DatabaseConfig }
  | { type: 'SET_SCHEMA_DEFINITION'; payload: SchemaDefinition }
  | { type: 'SET_ACH_FIELDS'; payload: ACHFields }
  | { type: 'SET_CLEARED_CHECKS_FIELDS'; payload: ClearedChecksFields }
  | { type: 'SET_TEST_CASE_CONFIG'; payload: TestCaseConfig }
  | { type: 'SET_GENERATED_DATA'; payload: GeneratedData | null }
  | { type: 'SET_OUTPUT_FILES'; payload: OutputFiles | null }
  | { type: 'SET_ENTIRE_STATE', payload: AppData }
  | { type: 'RESET_STATE' };

/**
 * The initial state of the application.
 */
const initialState: AppData = {
  databaseConfig: { tableName: '', outputFormat: 'ach' },
  schemaDefinition: { method: 'upload', schema: null },
  achFields: { routingNumber: '', accountNumber: '', amount: '', description: '' },
  clearedChecksFields: { bankAccountNumber: '', checkNumber: '', amount: '', date: '' },
  testCaseConfig: { testCaseType: 'basic', recordCount: 100 },
  generatedData: null,
  outputFiles: null,
};

/**
 * The initial state for the AppState, which includes the current step.
 */
const initialAppState: AppState = {
  currentStep: 1,
  ...initialState,
};

/**
 * The reducer function that handles state updates based on dispatched actions.
 * @param {AppState} state - The current state.
 * @param {AppAction} action - The action to be performed.
 * @returns {AppState} The new state.
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_DATABASE_CONFIG':
      return { ...state, databaseConfig: action.payload };
    case 'SET_SCHEMA_DEFINITION':
      return { ...state, schemaDefinition: action.payload };
    case 'SET_ACH_FIELDS':
      return { ...state, achFields: action.payload };
    case 'SET_CLEARED_CHECKS_FIELDS':
        return { ...state, clearedChecksFields: action.payload };
    case 'SET_TEST_CASE_CONFIG':
      return { ...state, testCaseConfig: action.payload };
    case 'SET_GENERATED_DATA':
      return { ...state, generatedData: action.payload };
    case 'SET_OUTPUT_FILES':
      return { ...state, outputFiles: action.payload };
    case 'SET_ENTIRE_STATE':
      return { ...state, ...action.payload };
    case 'RESET_STATE':
      return initialAppState;
    default:
      return state;
  }
}

/**
 * The shape of the context object.
 */
type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

/**
 * The React context for the application.
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * The provider component that makes the application state available to all child components.
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to be rendered.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * A custom hook to easily access the application context (state and dispatch function).
 * Throws an error if used outside of an `AppProvider`.
 * @returns {AppContextType} The application context.
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}