export type AccountType = 'checking' | 'savings' | 'credit_card' | 'loan';

export type AccountStatus = 'active' | 'frozen' | 'closed';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  accountNumber: string;
  routingNumber: string;
  availableBalance: number;
  currentBalance: number;
  status: AccountStatus;
  openedDate: string;
  lastActivityDate: string;
  creditLimit?: number;
  interestRate?: number;
  minimumPayment?: number;
  paymentDueDate?: string;
}

export interface AccountBalanceSummary {
  accountId: string;
  availableBalance: number;
  currentBalance: number;
  asOfDate: string;
}
