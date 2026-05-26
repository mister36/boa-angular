import { Account } from '../models/account.models';

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acct-chk-001',
    name: 'Primary Checking',
    type: 'checking',
    accountNumber: '4851239076',
    routingNumber: '026009593',
    availableBalance: 4532.17,
    currentBalance: 4682.17,
    status: 'active',
    openedDate: '2019-03-15',
    lastActivityDate: '2026-05-24'
  },
  {
    id: 'acct-chk-002',
    name: 'Secondary Checking',
    type: 'checking',
    accountNumber: '4851230412',
    routingNumber: '026009593',
    availableBalance: 1204.55,
    currentBalance: 1204.55,
    status: 'active',
    openedDate: '2021-08-22',
    lastActivityDate: '2026-05-20'
  },
  {
    id: 'acct-sav-001',
    name: 'Premium Savings',
    type: 'savings',
    accountNumber: '6729041583',
    routingNumber: '026009593',
    availableBalance: 28750.00,
    currentBalance: 28750.00,
    status: 'active',
    openedDate: '2018-11-01',
    lastActivityDate: '2026-05-15',
    interestRate: 4.25
  },
  {
    id: 'acct-cc-001',
    name: 'Platinum Visa',
    type: 'credit_card',
    accountNumber: '4400123456789012',
    routingNumber: '',
    availableBalance: 12660.00,
    currentBalance: -2340.00,
    status: 'active',
    openedDate: '2020-02-10',
    lastActivityDate: '2026-05-23',
    creditLimit: 15000,
    interestRate: 18.99,
    minimumPayment: 35.00,
    paymentDueDate: '2026-06-15'
  },
  {
    id: 'acct-loan-001',
    name: 'Auto Loan',
    type: 'loan',
    accountNumber: '7891234560',
    routingNumber: '',
    availableBalance: 0,
    currentBalance: -12890.44,
    status: 'active',
    openedDate: '2023-06-01',
    lastActivityDate: '2026-05-01',
    interestRate: 5.49,
    minimumPayment: 385.00,
    paymentDueDate: '2026-06-01'
  }
];
