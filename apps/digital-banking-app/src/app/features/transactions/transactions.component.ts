import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  TransactionApiClient,
  ProviderErrorMapper,
  Transaction,
  TransactionFilter,
  TransactionType,
  TransactionCategory,
  ProviderError
} from '@boa/financial-data';
import { AuditLogService } from '@boa/audit-logging';
import { AnalyticsService } from '@boa/analytics';
import { DataTableColumn } from '@boa/design-system';
import { TransactionDetailDialogComponent } from './transaction-detail/transaction-detail-dialog.component';

@Component({
  selector: 'boa-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  loading = true;
  error: string | null = null;
  filterForm!: FormGroup;

  transactionTypes: TransactionType[] = ['debit', 'credit'];
  transactionCategories: TransactionCategory[] = [
    'purchase', 'payment', 'transfer', 'fee', 'deposit', 'refund', 'withdrawal', 'interest'
  ];

  tableColumns: DataTableColumn[] = [
    { key: 'date', label: 'Date', sortable: true, type: 'date' },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'merchantName', label: 'Merchant', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, type: 'currency' },
    { key: 'status', label: 'Status', sortable: true }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private transactionApi: TransactionApiClient,
    private providerErrorMapper: ProviderErrorMapper,
    private auditLogService: AuditLogService,
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.analyticsService.trackPageView('/transactions');

    this.filterForm = this.fb.group({
      searchTerm: [''],
      type: [null],
      category: [null],
      startDate: [null],
      endDate: [null]
    });

    this.filterForm.get('searchTerm')!.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());

    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    const formValue = this.filterForm.value;
    const filter: TransactionFilter = {
      searchTerm: formValue.searchTerm || undefined,
      type: formValue.type || undefined,
      category: formValue.category || undefined,
      startDate: formValue.startDate ? this.formatDate(formValue.startDate) : undefined,
      endDate: formValue.endDate ? this.formatDate(formValue.endDate) : undefined
    };
    this.loadTransactions(filter);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadTransactions();
  }

  onRowClick(transaction: Transaction): void {
    this.dialog.open(TransactionDetailDialogComponent, {
      width: '500px',
      data: transaction
    });
  }

  exportTransactions(): void {
    const formValue = this.filterForm.value;
    const filter: TransactionFilter = {
      searchTerm: formValue.searchTerm || undefined,
      type: formValue.type || undefined,
      category: formValue.category || undefined,
      startDate: formValue.startDate ? this.formatDate(formValue.startDate) : undefined,
      endDate: formValue.endDate ? this.formatDate(formValue.endDate) : undefined
    };

    this.transactionApi.exportTransactions(filter).subscribe({
      next: (result) => {
        if (result.success) {
          this.auditLogService.logExportTransactions(null, {
            filters: { searchTerm: formValue.searchTerm, type: formValue.type, category: formValue.category, startDate: formValue.startDate, endDate: formValue.endDate },
            recordCount: result.recordCount!,
            format: 'csv'
          });
          this.analyticsService.trackButtonClick('export_transactions');
        }
      }
    });
  }

  private loadTransactions(filter?: TransactionFilter): void {
    this.loading = true;
    this.error = null;

    this.transactionApi.getTransactions(filter).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = this.isProviderError(err)
          ? this.providerErrorMapper.getErrorMessage(err)
          : 'Unable to load transactions. Please try again.';
        this.loading = false;
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
