'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { AppState } from '@/types/application';
import type { DatabaseConfig } from '@/types/database';
import type { SchemaDefinition } from '@/types/database';

type AppAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_DATABASE_CONFIG'; payload: DatabaseConfig }
  | { type: 'SET_SCHEMA_DEFINITION'; payload: SchemaDefinition }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'SET_ACH_FIELDS'; payload: any }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'SET_TEST_CASE_CONFIG'; payload: any }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'SET_GENERATED_DATA'; payload: any }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'SET_OUTPUT_FILES'; payload: any }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  currentStep: 1,
  isStepComplete: () => false,
  databaseConfig: { name: '', outputFormat: 'fixed-width' },
  schemaDefinition: { tableName: '', columns: [] },
  achFields: {},
  testCaseConfig: {},
  generatedData: {},
  outputFiles: {},
};

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
    case 'SET_TEST_CASE_CONFIG':
      return { ...state, testCaseConfig: action.payload };
    case 'SET_GENERATED_DATA':
      return { ...state, generatedData: action.payload };
    case 'SET_OUTPUT_FILES':
      return { ...state, outputFiles: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 