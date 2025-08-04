/**
 * Defines the structure for a single ACH (Automated Clearing House) transaction.
 * This interface can be used to represent a payment, debit, or other type of transaction.
 */
export interface ACHTransaction {
  /** The 9-digit ABA routing number of the receiving financial institution. */
  routingNumber: string;
  /** The bank account number of the receiver. */
  accountNumber: string;
  /** The transaction amount in dollars and cents. */
  amount: number;
  /** A code that specifies the type of transaction (e.g., '22' for checking deposit, '32' for savings deposit). */
  transactionCode: string;
  /** The name of the person or company receiving the funds. */
  receiverName: string;
  /** A unique number assigned by the originating bank to identify the transaction. */
  traceNumber: string;
  /** An optional description for the payment that may appear on the receiver's bank statement. */
  description?: string;
  /** The date the transaction is intended to be settled. */
  effectiveDate?: Date;
  /** The type of account (e.g., 'checking' or 'savings'). */
  accountType?: 'checking' | 'savings';
}