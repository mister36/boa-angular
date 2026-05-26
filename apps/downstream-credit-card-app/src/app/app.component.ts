import { Component, OnInit } from '@angular/core';
import { AccountApiClient, TransactionApiClient, Account, Transaction } from '@boa/financial-data';
import { DataTableColumn } from '@boa/design-system';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'boa-cc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  account: Account | null = null;
  transactions: Transaction[] = [];
  loading = true;
  error: string | null = null;

  tableColumns: DataTableColumn[] = [
    { key: 'date', label: 'Date', sortable: true, type: 'date' },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'merchantName', label: 'Merchant', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, type: 'currency' },
    { key: 'status', label: 'Status', sortable: true }
  ];

  constructor(
    private accountApi: AccountApiClient,
    private transactionApi: TransactionApiClient
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get availableCredit(): number {
    return this.account?.availableBalance ?? 0;
  }

  get currentBalance(): number {
    return this.account ? Math.abs(this.account.currentBalance) : 0;
  }

  get creditLimit(): number {
    return this.account?.creditLimit ?? 0;
  }

  get utilizationPercent(): number {
    if (!this.account?.creditLimit) return 0;
    return Math.round((this.currentBalance / this.account.creditLimit) * 100);
  }

  get paymentDueDate(): string {
    return this.account?.paymentDueDate ?? '';
  }

  get minimumPayment(): number {
    return this.account?.minimumPayment ?? 0;
  }

  get isPaymentDueSoon(): boolean {
    if (!this.account?.paymentDueDate) return false;
    const due = new Date(this.account.paymentDueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 30 && daysUntilDue > 0;
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      account: this.accountApi.getAccountById('acct-cc-001'),
      transactions: this.transactionApi.getTransactionsByAccount('acct-cc-001')
    }).subscribe({
      next: ({ account, transactions }) => {
        this.account = account;
        this.transactions = transactions;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Unable to load credit card information. Please try again later.';
        this.loading = false;
      }
    });
  }
}
