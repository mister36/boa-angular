export enum AuditEventType {
  LoginAttempt = 'login_attempt',
  MfaSuccess = 'mfa_success',
  MfaFailure = 'mfa_failure',
  Logout = 'logout',
  TransferReview = 'transfer_review',
  TransferConfirmation = 'transfer_confirmation',
  BillPayConfirmation = 'bill_pay_confirmation',
  ProfileSecurityChange = 'profile_security_change',
  ExportTransactions = 'export_transactions',
  SessionExpired = 'session_expired'
}

export enum AuditSeverity {
  Info = 'info',
  Warning = 'warning',
  Critical = 'critical'
}

export interface AuditEvent {
  eventType: AuditEventType;
  severity: AuditSeverity;
  correlationId: string;
  userId: string | null;
  timestamp: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
}

export interface TransferAuditData {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  confirmationNumber?: string;
}

export interface BillPayAuditData {
  payeeId: string;
  payeeName: string;
  amount: number;
  scheduledDate: string;
  sourceAccountId: string;
  confirmationNumber?: string;
}

export interface ExportAuditData {
  filters: Record<string, unknown>;
  recordCount: number;
  format?: string;
}
