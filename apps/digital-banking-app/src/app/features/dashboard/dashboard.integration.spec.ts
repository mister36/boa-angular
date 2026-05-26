import { TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AccountApiClient, TransactionApiClient, ProviderErrorMapper, Account, Transaction } from '@boa/financial-data';
import { AnalyticsService } from '@boa/analytics';

describe('Dashboard Integration', () => {
  let component: DashboardComponent;
  let accountApi: jasmine.SpyObj<AccountApiClient>;
  let transactionApi: jasmine.SpyObj<TransactionApiClient>;
  let providerErrorMapper: ProviderErrorMapper;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  const mockAccounts: Account[] = [
    {
      id: 'acct-chk-001', name: 'Checking', type: 'checking',
      accountNumber: '1234567890', routingNumber: '021000021',
      availableBalance: 5432.10, currentBalance: 5500.00,
      status: 'active', openedDate: '2020-01-15', lastActivityDate: '2024-01-10'
    },
    {
      id: 'acct-sav-001', name: 'Savings', type: 'savings',
      accountNumber: '9876543210', routingNumber: '021000021',
      availableBalance: 15000.00, currentBalance: 15000.00,
      status: 'active', openedDate: '2020-01-15', lastActivityDate: '2024-01-05'
    },
    {
      id: 'acct-cc-001', name: 'Credit Card', type: 'credit_card',
      accountNumber: '4111111111111111', routingNumber: '',
      availableBalance: 8000, currentBalance: 2000,
      status: 'active', openedDate: '2021-06-01', lastActivityDate: '2024-01-09',
      creditLimit: 10000
    }
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 'txn-001', accountId: 'acct-chk-001', date: '2024-01-10',
      description: 'Grocery Store', merchantName: 'Whole Foods',
      amount: -85.50, type: 'debit', category: 'purchase',
      status: 'posted', runningBalance: 5432.10
    } as Transaction
  ];

  beforeEach(() => {
    accountApi = jasmine.createSpyObj('AccountApiClient', ['getAccounts']);
    transactionApi = jasmine.createSpyObj('TransactionApiClient', ['getTransactions']);
    analyticsService = jasmine.createSpyObj('AnalyticsService', ['trackPageView']);
    providerErrorMapper = new ProviderErrorMapper();

    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: AccountApiClient, useValue: accountApi },
        { provide: TransactionApiClient, useValue: transactionApi },
        { provide: ProviderErrorMapper, useValue: providerErrorMapper },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        ChangeDetectorRef
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  it('should load accounts and compute total balance from checking + savings', () => {
    accountApi.getAccounts.and.returnValue(of(mockAccounts));
    transactionApi.getTransactions.and.returnValue(of(mockTransactions));

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.accounts.length).toBe(3);
    expect(component.totalBalance).toBe(5432.10 + 15000.00);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should show recent transactions (max 5)', () => {
    accountApi.getAccounts.and.returnValue(of(mockAccounts));
    transactionApi.getTransactions.and.returnValue(of(mockTransactions));

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.recentTransactions.length).toBeLessThanOrEqual(5);
  });

  it('should handle provider error with user-friendly message', () => {
    const providerError = {
      code: 'PROVIDER_TIMEOUT',
      technicalMessage: 'Connection timed out',
      retryable: true
    };
    accountApi.getAccounts.and.returnValue(throwError(() => providerError));
    transactionApi.getTransactions.and.returnValue(of([]));

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBeTruthy();
    expect(component.error).toContain('trouble connecting');
    expect(component.loading).toBeFalse();
  });

  it('should handle generic errors gracefully', () => {
    accountApi.getAccounts.and.returnValue(throwError(() => new Error('Network failure')));
    transactionApi.getTransactions.and.returnValue(of([]));

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBeTruthy();
    expect(component.error).toContain('unexpected error');
  });

  it('should track page view on init', () => {
    accountApi.getAccounts.and.returnValue(of([]));
    transactionApi.getTransactions.and.returnValue(of([]));

    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();

    expect(analyticsService.trackPageView).toHaveBeenCalledWith('/dashboard');
  });

  it('should map credit_card type to credit for display', () => {
    accountApi.getAccounts.and.returnValue(of(mockAccounts));
    transactionApi.getTransactions.and.returnValue(of(mockTransactions));

    const fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.mapAccountType('credit_card')).toBe('credit');
    expect(component.mapAccountType('checking')).toBe('checking');
  });
});
