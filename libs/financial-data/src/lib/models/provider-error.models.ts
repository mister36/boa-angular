export type ProviderErrorCode =
  | 'PROVIDER_TIMEOUT'
  | 'INSUFFICIENT_FUNDS'
  | 'ACCOUNT_FROZEN'
  | 'ACCOUNT_CLOSED'
  | 'SERVICE_UNAVAILABLE'
  | 'INVALID_ACCOUNT'
  | 'DUPLICATE_TRANSACTION'
  | 'DAILY_LIMIT_EXCEEDED'
  | 'TRANSFER_LIMIT_EXCEEDED'
  | 'PAYEE_NOT_FOUND'
  | 'INVALID_AMOUNT'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface UserFriendlyError {
  code: ProviderErrorCode;
  title: string;
  message: string;
  actionLabel?: string;
  retryable: boolean;
}

export const PROVIDER_ERROR_MAP: Record<ProviderErrorCode, UserFriendlyError> = {
  PROVIDER_TIMEOUT: {
    code: 'PROVIDER_TIMEOUT',
    title: 'Connection Timeout',
    message: 'We\'re having trouble connecting to our systems. Please try again in a few moments.',
    actionLabel: 'Try Again',
    retryable: true
  },
  INSUFFICIENT_FUNDS: {
    code: 'INSUFFICIENT_FUNDS',
    title: 'Insufficient Funds',
    message: 'The source account does not have enough available funds to complete this transaction.',
    retryable: false
  },
  ACCOUNT_FROZEN: {
    code: 'ACCOUNT_FROZEN',
    title: 'Account Restricted',
    message: 'This account is currently restricted. Please contact customer service for assistance.',
    actionLabel: 'Contact Support',
    retryable: false
  },
  ACCOUNT_CLOSED: {
    code: 'ACCOUNT_CLOSED',
    title: 'Account Closed',
    message: 'This account has been closed and is no longer available for transactions.',
    retryable: false
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    title: 'Service Unavailable',
    message: 'This service is temporarily unavailable. We apologize for the inconvenience.',
    actionLabel: 'Try Again Later',
    retryable: true
  },
  INVALID_ACCOUNT: {
    code: 'INVALID_ACCOUNT',
    title: 'Invalid Account',
    message: 'The specified account could not be found. Please verify your account information.',
    retryable: false
  },
  DUPLICATE_TRANSACTION: {
    code: 'DUPLICATE_TRANSACTION',
    title: 'Duplicate Transaction',
    message: 'A similar transaction was recently submitted. Please verify this is not a duplicate.',
    retryable: false
  },
  DAILY_LIMIT_EXCEEDED: {
    code: 'DAILY_LIMIT_EXCEEDED',
    title: 'Daily Limit Reached',
    message: 'You have reached your daily transaction limit. Please try again tomorrow.',
    retryable: false
  },
  TRANSFER_LIMIT_EXCEEDED: {
    code: 'TRANSFER_LIMIT_EXCEEDED',
    title: 'Transfer Limit Exceeded',
    message: 'The transfer amount exceeds your allowed limit. Please reduce the amount or contact us to increase your limit.',
    retryable: false
  },
  PAYEE_NOT_FOUND: {
    code: 'PAYEE_NOT_FOUND',
    title: 'Payee Not Found',
    message: 'The selected payee could not be found. Please verify the payee information.',
    retryable: false
  },
  INVALID_AMOUNT: {
    code: 'INVALID_AMOUNT',
    title: 'Invalid Amount',
    message: 'The specified amount is not valid. Please enter a positive amount.',
    retryable: false
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    title: 'Connection Error',
    message: 'Unable to connect. Please check your internet connection and try again.',
    actionLabel: 'Retry',
    retryable: true
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again or contact customer support if the problem persists.',
    actionLabel: 'Try Again',
    retryable: true
  }
};
