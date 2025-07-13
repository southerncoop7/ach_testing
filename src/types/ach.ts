export interface ACHTransaction {
  routingNumber: string;
  accountNumber: string;
  amount: number;
  transactionCode: string;
  receiverName: string;
  traceNumber: string;
  // ... other ACH fields
} 