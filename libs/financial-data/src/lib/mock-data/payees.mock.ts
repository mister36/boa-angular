import { Payee } from '../models/transfer.models';

export const MOCK_PAYEES: Payee[] = [
  {
    id: 'payee-001',
    name: 'City Electric Company',
    nickname: 'Electric Bill',
    accountNumber: '8827364501',
    category: 'utilities',
    lastPaymentDate: '2026-04-28',
    lastPaymentAmount: 142.50,
    isAutoPay: false
  },
  {
    id: 'payee-002',
    name: 'Comcast Cable Services',
    nickname: 'Internet/Cable',
    accountNumber: '7742901234',
    category: 'telecommunications',
    lastPaymentDate: '2026-05-01',
    lastPaymentAmount: 189.99,
    isAutoPay: true
  },
  {
    id: 'payee-003',
    name: 'Bank of America Visa',
    nickname: 'Visa Card',
    accountNumber: '4400123456789012',
    category: 'financial',
    lastPaymentDate: '2026-05-15',
    lastPaymentAmount: 500.00,
    isAutoPay: false
  },
  {
    id: 'payee-004',
    name: 'Parkview Apartments LLC',
    nickname: 'Rent',
    accountNumber: '90221847',
    routingNumber: '021000089',
    category: 'housing',
    lastPaymentDate: '2026-05-01',
    lastPaymentAmount: 1850.00,
    isAutoPay: true
  },
  {
    id: 'payee-005',
    name: 'State Farm Insurance',
    nickname: 'Auto Insurance',
    accountNumber: 'POL-8834721',
    category: 'insurance',
    lastPaymentDate: '2026-05-10',
    lastPaymentAmount: 156.00,
    isAutoPay: true
  },
  {
    id: 'payee-006',
    name: 'AT&T Wireless',
    nickname: 'Phone Bill',
    accountNumber: '555012349876',
    category: 'telecommunications',
    lastPaymentDate: '2026-05-20',
    lastPaymentAmount: 95.00,
    isAutoPay: false
  },
  {
    id: 'payee-007',
    name: 'City Water & Sewer',
    nickname: 'Water Bill',
    accountNumber: 'WS-44291038',
    category: 'utilities',
    lastPaymentDate: '2026-04-15',
    lastPaymentAmount: 67.30,
    isAutoPay: false
  },
  {
    id: 'payee-008',
    name: 'Planet Fitness',
    nickname: 'Gym',
    accountNumber: 'MEM-9912045',
    category: 'subscription',
    lastPaymentDate: '2026-05-01',
    lastPaymentAmount: 24.99,
    isAutoPay: true
  }
];
