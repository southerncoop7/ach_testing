export interface DatabaseConfig {
  databaseName: string;
  outputFormat: 'sql' | 'fixed-width' | 'nacha';
}

export interface SchemaDefinition {
  method: 'upload' | 'manual';
  schema: {
    fileName?: string;
    content?: string | null;
  } | null;
}

export interface ACHFields {
  routingNumber: string;
  accountNumber: string;
  amount: string;
  description: string;
}

export interface TestCaseConfig {
  testCaseType: string;
  recordCount: number;
}

export interface GeneratedData {
  records: Array<{
    id: number;
    routingNumber: string;
    accountNumber: string;
    amount: string;
    description: string;
    transactionDate: string;
    status: string;
  }>;
  totalCount: number;
}

export interface OutputFiles {
  files: string[];
  generatedAt: string;
}

export interface AppData {
  databaseConfig: DatabaseConfig;
  schemaDefinition: SchemaDefinition;
  achFields: ACHFields;
  testCaseConfig: TestCaseConfig;
  generatedData: GeneratedData | null;
  outputFiles: OutputFiles | null;
}

export interface StepProps {
  data: AppData;
  onUpdate: (key: keyof AppData, value: AppData[keyof AppData]) => void;
  onNext: () => void;
  onPrevious: () => void;
  isComplete: boolean;
} 