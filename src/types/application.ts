/**
 * Defines the configuration for the database, including its name and the desired output format.
 */
export interface DatabaseConfig {
  tableName: string;
  outputFormat: 'ach' | 'ach-return' | 'cleared-check' | 'origination-reject';
}

/**
 * Defines the structure for the schema definition, which can be provided by uploading a file or manually.
 */
export interface SchemaDefinition {
  method: 'upload' | 'manual';
  schema: {
    fileName?: string;
    content?: string | null;
  } | null;
}

/**
 * Defines the fields required for a standard ACH (Automated Clearing House) transaction.
 */
export interface ACHFields {
  routingNumber: string;
  accountNumber: string;
  amount: string;
  description: string;
}

/**
 * Defines the configuration for generating test cases, including the type, number of records, and scenario-specific counts.
 */
export interface TestCaseConfig {
  testCaseType: string;
  recordCount: number;
  scenarioCounts?: { [key: string]: number };
}

/**
 * Defines the structure for the generated data, including the records and the total count.
 */
export interface GeneratedData {
  records: Array<Record<string, unknown>>; // The actual records can have different shapes
  totalCount: number;
}

/**
 * Defines the structure for the output files, including the file names and generation timestamp.
 */
export interface OutputFiles {
  files: string[];
  generatedAt: string;
}

/**
 * Defines the fields required for the "Cleared Checks" format.
 */
export interface ClearedChecksFields {
  bankAccountNumber: string;
  checkNumber: string;
  amount: string;
  date: string;
  [key:string]: string; // Allows for dynamic key access in forms
}

/**
 * Represents the overall data structure for the application, combining all configuration and data parts.
 */
export interface AppData {
  databaseConfig: DatabaseConfig;
  schemaDefinition: SchemaDefinition;
  achFields: ACHFields;
  clearedChecksFields: ClearedChecksFields;
  testCaseConfig: TestCaseConfig;
  generatedData: GeneratedData | null;
  outputFiles: OutputFiles | null;
  clearedChecksData?: {
    pastedData: string;
    parsedData?: Record<string, string>[];
  };
}

/**
 * Represents the complete state of the application, including the current step and all application data.
 * This is intended for use with a React context and reducer pattern.
 */
export interface AppState extends AppData {
    currentStep: number;
}

/**
 * Defines the props that are passed to each step component in the multi-step form.
 */
export interface StepProps {
  data: AppData;
  onUpdate: (key: keyof AppData, value: AppData[keyof AppData]) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
}