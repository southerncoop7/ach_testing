export interface DatabaseConfig {
  name: string;
  outputFormat: 'fixed-width' | 'nacha';
}

export interface SchemaDefinition {
  tableName: string;
  columns: ColumnDefinition[];
}

export interface ColumnDefinition {
  name: string;
  dataType: string;
  constraints: string[];
  isPrimaryKey: boolean;
} 