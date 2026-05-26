import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { of, throwError } from 'rxjs';
import { TransactionsComponent } from './transactions.component';
import { TransactionApiClient, ProviderErrorMapper, Transaction } from '@boa/financial-data';
import { AuditLogService } from '@boa/audit-logging';
import { AnalyticsService } from '@boa/analytics';

describe('Transactions Integration', () => {
  let component: TransactionsComponent;
  let transactionApi: jasmine.SpyObj<TransactionApiClient>;
  let providerErrorMapper: ProviderErrorMapper;
  let auditLogService: jasmine.SpyObj<AuditLogService>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  const mockTransactions: Transaction[] = [
    {
      id: 'txn-001', accountId: 'acct-001', date: '2024-01-10',
      description: 'Coffee Shop', merchantName: 'Starbucks',
      amount: -5.50, type: 'debit', category: 'purchase',
      status: 'posted', runningBalance: 5000
    } as Transaction,
    {
      id: 'txn-002', accountId: 'acct-001', date: '2024-01-09',
      description: 'Salary Deposit', merchantName: 'Employer Inc',
      amount: 3000, type: 'credit', category: 'deposit',
      status: 'posted', runningBalance: 5005.50
    } as Transaction
  ];

  beforeEach(() => {
    transactionApi = jasmine.createSpyObj('TransactionApiClient', ['getTransactions', 'exportTransactions']);
    auditLogService = jasmine.createSpyObj('AuditLogService', ['logExportTransactions']);
    analyticsService = jasmine.createSpyObj('AnalyticsService', ['trackPageView', 'trackButtonClick']);
    providerErrorMapper = new ProviderErrorMapper();

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule
      ],
      declarations: [TransactionsComponent],
      providers: [
        { provide: TransactionApiClient, useValue: transactionApi },
        { provide: ProviderErrorMapper, useValue: providerErrorMapper },
        { provide: AuditLogService, useValue: auditLogService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        ChangeDetectorRef
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('should load transactions successfully', () => {
    transactionApi.getTransactions.and.returnValue(of(mockTransactions));

    const fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.transactions.length).toBe(2);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should handle provider error with mapped message', () => {
    const providerError = {
      code: 'SERVICE_UNAVAILABLE',
      technicalMessage: 'Backend down',
      retryable: true
    };
    transactionApi.getTransactions.and.returnValue(throwError(() => providerError));

    const fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBeTruthy();
    expect(component.error).toContain('temporarily unavailable');
    expect(component.loading).toBeFalse();
  });

  it('should handle generic error gracefully', () => {
    transactionApi.getTransactions.and.returnValue(throwError(() => new Error('Random error')));

    const fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toContain('Unable to load transactions');
  });

  it('should export transactions and fire audit log', () => {
    transactionApi.getTransactions.and.returnValue(of(mockTransactions));
    transactionApi.exportTransactions.and.returnValue(of({ success: true, recordCount: 10 }));

    const fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.exportTransactions();

    expect(auditLogService.logExportTransactions).toHaveBeenCalled();
    expect(analyticsService.trackButtonClick).toHaveBeenCalledWith('export_transactions');
  });

  it('should track page view on init', () => {
    transactionApi.getTransactions.and.returnValue(of([]));

    const fixture = TestBed.createComponent(TransactionsComponent);
    fixture.detectChanges();

    expect(analyticsService.trackPageView).toHaveBeenCalledWith('/transactions');
  });
});
