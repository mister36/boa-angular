export enum AnalyticsEventType {
  PageView = 'page_view',
  ButtonClick = 'button_click',
  FormStep = 'form_step',
  Error = 'error',
  TransferCompleted = 'transfer_completed',
  BillPayCompleted = 'bill_pay_completed'
}

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: string;
  correlationId: string;
  userSegment: string | null;
  payload: Record<string, unknown>;
}

export interface PageViewPayload {
  routePath: string;
  routeName?: string;
  previousRoute?: string;
}

export interface ButtonClickPayload {
  label: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface FormStepPayload {
  formName: string;
  stepIndex: number;
  stepName?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorPayload {
  errorMessage: string;
  errorCode?: string;
  context?: string;
  stackTrace?: string;
}

export interface TransferPayload {
  sourceAccountId?: string;
  destinationAccountId?: string;
  amount?: number;
  currency?: string;
  confirmationNumber?: string;
}

export interface BillPayPayload {
  payeeId?: string;
  payeeName?: string;
  amount?: number;
  scheduledDate?: string;
  confirmationNumber?: string;
}
