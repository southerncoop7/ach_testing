import type { DatabaseConfig } from './database';
import type { SchemaDefinition } from './database';

export interface AppState {
  currentStep: number;
  isStepComplete: (step: number) => boolean;
  databaseConfig: DatabaseConfig;
  schemaDefinition: SchemaDefinition;
  // TODO: Replace 'any' with proper types as they are defined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  achFields: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testCaseConfig: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatedData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputFiles: any;
} 