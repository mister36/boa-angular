import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AccountApiClient,
  TransactionApiClient,
  ProviderErrorMapper,
  Account,
  Transaction,
  TransactionFilter,
  TransactionType,
  ProviderError
} from '@boa/financial-data';
import { AuditLogService } from '@boa/audit-logging';
import { AnalyticsService } from '@boa/analytics';
import { maskAccountNumber, maskRoutingNumber } from '@boa/shared-utils';
import { DataTableColumn } from '@boa/design-system';

@Component({
  selector: 'boa-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailComponent implements OnInit {
  account: Account | null = null;
  transactions: Transaction[] = [];
  loading = true;
  transactionsLoading = false;
  error: string | null = null;
  filterForm!: FormGroup;

  maskedAccountNumber = '';
  maskedRoutingNumber = '';

  transactionTypes: TransactionType[] = ['debit', 'credit'];

  tableColumns: DataTableColumn[] = [
    { key: 'date', label: 'Date', sortable: true, type: 'date' },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, type: 'currency' },
    { key: 'status', label: 'Status', sortable: true }
  ];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private accountApi: AccountApiClient,
    private transactionApi: TransactionApiClient,
    private providerErrorMapper: ProviderErrorMapper,
    private auditLogService: AuditLogService,
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      type: [null],
      startDate: [null],
      endDate: [null]
    });

    const accountId = this.route.snapshot.paramMap.get('id')!;
    this.analyticsService.trackPageView('/accounts/' + accountId);
    this.loadAccountData(accountId);
  }

  applyFilters(): void {
    const accountId = this.route.snapshot.paramMap.get('id')!;
    const formValue = this.filterForm.value;
    const filter: TransactionFilter = {
      accountId,
      type: formValue.type || undefined,
      startDate: formValue.startDate ? this.formatDate(formValue.startDate) : undefined,
      endDate: formValue.endDate ? this.formatDate(formValue.endDate) : undefined
    };
    this.loadTransactions(filter);
  }

  clearFilters(): void {
    this.filterForm.reset();
    const accountId = this.route.snapshot.paramMap.get('id')!;
    this.loadTransactions({ accountId });
  }

  downloadTransactions(): void {
    const accountId = this.route.snapshot.paramMap.get('id')!;
    const formValue = this.filterForm.value;
    const filter: TransactionFilter = {
      accountId,
      type: formValue.type || undefined,
      startDate: formValue.startDate ? this.formatDate(formValue.startDate) : undefined,
      endDate: formValue.endDate ? this.formatDate(formValue.endDate) : undefined
    };

    this.transactionApi.exportTransactions(filter).subscribe({
      next: (result) => {
        if (result.success) {
          this.auditLogService.logExportTransactions(null, {
            filters: { accountId, type: formValue.type, startDate: formValue.startDate, endDate: formValue.endDate },
            recordCount: result.recordCount!,
            format: 'csv'
          });
        }
      }
    });
  }

  private loadAccountData(accountId: string): void {
    this.loading = true;
    this.error = null;

    this.accountApi.getAccountById(accountId).subscribe({
      next: (account) => {
        this.account = account;
        this.maskedAccountNumber = maskAccountNumber(account.accountNumber);
        this.maskedRoutingNumber = maskRoutingNumber(account.routingNumber);
        this.loading = false;
        this.cdr.markForCheck();
        this.loadTransactions({ accountId });
      },
      error: (err) => {
        this.error = this.isProviderError(err)
          ? this.providerErrorMapper.getErrorMessage(err)
          : 'Unable to load account details.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadTransactions(filter: TransactionFilter): void {
    this.transactionsLoading = true;
    this.transactionApi.getTransactions(filter).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.transactionsLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.transactions = [];
        this.transactionsLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private isProviderError(err: unknown): err is ProviderError {
    return typeof err === 'object' && err !== null && 'code' in err && 'technicalMessage' in err;
  }
}
