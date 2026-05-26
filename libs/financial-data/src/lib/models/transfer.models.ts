export type TransferStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface TransferRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  memo?: string;
  scheduledDate?: string;
}

export interface TransferValidationResult {
  valid: boolean;
  errors: TransferValidationError[];
}

export interface TransferValidationError {
  field: string;
  code: string;
  message: string;
}

export interface TransferResult {
  success: boolean;
  confirmationNumber?: string;
  status?: TransferStatus;
  error?: ProviderError;
  estimatedCompletionDate?: string;
  submittedAt?: string;
}

export interface ProviderError {
  code: string;
  technicalMessage: string;
  providerReference?: string;
  retryable: boolean;
}

export interface Payee {
  id: string;
  name: string;
  nickname?: string;
  accountNumber: string;
  routingNumber?: string;
  category: PayeeCategory;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  isAutoPay: boolean;
}

export type PayeeCategory =
  | 'utilities'
  | 'telecommunications'
  | 'insurance'
  | 'housing'
  | 'financial'
  | 'subscription'
  | 'other';

export interface BillPaymentRequest {
  payeeId: string;
  sourceAccountId: string;
  amount: number;
  scheduledDate: string;
  memo?: string;
}

export interface BillPaymentResult {
  success: boolean;
  confirmationNumber?: string;
  scheduledDate?: string;
  error?: ProviderError;
}
