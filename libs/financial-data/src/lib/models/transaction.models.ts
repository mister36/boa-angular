export type TransactionType = 'debit' | 'credit';

export type TransactionCategory =
  | 'purchase'
  | 'payment'
  | 'transfer'
  | 'fee'
  | 'deposit'
  | 'refund'
  | 'withdrawal'
  | 'interest';

export type TransactionStatus = 'posted' | 'pending';

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  merchantName?: string;
  status: TransactionStatus;
  referenceNumber: string;
  runningBalance?: number;
}

export interface TransactionFilter {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  category?: TransactionCategory;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface TransactionExportResult {
  success: boolean;
  filename?: string;
  recordCount?: number;
  error?: string;
}
