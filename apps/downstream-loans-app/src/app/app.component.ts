import { Component, OnInit } from '@angular/core';
import { AccountApiClient, Account } from '@boa/financial-data';
import { DataTableColumn } from '@boa/design-system';

interface PaymentScheduleRow {
  paymentNumber: number;
  paymentDate: string;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
}

@Component({
  selector: 'boa-loans-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  account: Account | null = null;
  paymentSchedule: PaymentScheduleRow[] = [];
  loading = true;
  error: string | null = null;

  tableColumns: DataTableColumn[] = [
    { key: 'paymentNumber', label: '#', sortable: false },
    { key: 'paymentDate', label: 'Payment Date', sortable: false, type: 'date' },
    { key: 'totalPayment', label: 'Payment', sortable: false, type: 'currency' },
    { key: 'principal', label: 'Principal', sortable: false, type: 'currency' },
    { key: 'interest', label: 'Interest', sortable: false, type: 'currency' },
    { key: 'remainingBalance', label: 'Remaining Balance', sortable: false, type: 'currency' }
  ];

  constructor(private accountApi: AccountApiClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  get remainingBalance(): number {
    return this.account ? Math.abs(this.account.currentBalance) : 0;
  }

  get monthlyPayment(): number {
    return this.account?.minimumPayment ?? 0;
  }

  get interestRate(): number {
    return this.account?.interestRate ?? 0;
  }

  get nextPaymentDate(): string {
    return this.account?.paymentDueDate ?? '';
  }

  get totalInterest(): number {
    return this.paymentSchedule.reduce((sum, row) => sum + row.interest, 0);
  }

  get totalCost(): number {
    return this.paymentSchedule.reduce((sum, row) => sum + row.totalPayment, 0);
  }

  get estimatedPayoffDate(): string {
    if (this.paymentSchedule.length === 0) return '';
    return this.paymentSchedule[this.paymentSchedule.length - 1].paymentDate;
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    this.accountApi.getAccountById('acct-loan-001').subscribe({
      next: (account) => {
        this.account = account;
        this.paymentSchedule = this.generateAmortizationSchedule(account);
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load loan information. Please try again later.';
        this.loading = false;
      }
    });
  }

  private generateAmortizationSchedule(account: Account): PaymentScheduleRow[] {
    const schedule: PaymentScheduleRow[] = [];
    let balance = Math.abs(account.currentBalance);
    const monthlyRate = (account.interestRate ?? 0) / 100 / 12;
    const monthlyPayment = account.minimumPayment ?? 0;

    if (monthlyPayment <= 0 || balance <= 0) return [];

    const startDate = account.paymentDueDate
      ? new Date(account.paymentDueDate)
      : new Date();

    for (let i = 0; i < 12 && balance > 0; i++) {
      const interestCharge = balance * monthlyRate;
      const principalPayment = Math.min(monthlyPayment - interestCharge, balance);
      const payment = principalPayment + interestCharge;
      balance = Math.max(balance - principalPayment, 0);

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      schedule.push({
        paymentNumber: i + 1,
        paymentDate: paymentDate.toISOString().split('T')[0],
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestCharge * 100) / 100,
        totalPayment: Math.round(payment * 100) / 100,
        remainingBalance: Math.round(balance * 100) / 100
      });
    }

    return schedule;
  }
}
