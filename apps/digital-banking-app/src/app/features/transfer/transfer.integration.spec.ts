import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TransferComponent } from './transfer.component';
import {
  AccountApiClient,
  TransferApiClient,
  Account,
  TransferResult,
  TransferValidationResult
} from '@boa/financial-data';
import { AuditLogService } from '@boa/audit-logging';
import { AnalyticsService } from '@boa/analytics';
import { AuthService } from '@boa/auth';

describe('Transfer Integration', () => {
  let component: TransferComponent;
  let accountApi: jasmine.SpyObj<AccountApiClient>;
  let transferApi: jasmine.SpyObj<TransferApiClient>;
  let auditLogService: jasmine.SpyObj<AuditLogService>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;
  let authService: jasmine.SpyObj<AuthService>;

  const mockAccounts: Account[] = [
    {
      id: 'acct-chk-001', name: 'Checking', type: 'checking',
      accountNumber: '1234567890', routingNumber: '021000021',
      availableBalance: 5000, currentBalance: 5000,
      status: 'active', openedDate: '2020-01-15', lastActivityDate: '2024-01-10'
    },
    {
      id: 'acct-sav-001', name: 'Savings', type: 'savings',
      accountNumber: '9876543210', routingNumber: '021000021',
      availableBalance: 15000, currentBalance: 15000,
      status: 'active', openedDate: '2020-01-15', lastActivityDate: '2024-01-05'
    }
  ];

  beforeEach(() => {
    accountApi = jasmine.createSpyObj('AccountApiClient', ['getAccounts']);
    transferApi = jasmine.createSpyObj('TransferApiClient', ['validateTransfer', 'submitTransfer']);
    auditLogService = jasmine.createSpyObj('AuditLogService', ['logTransferReview', 'logTransferConfirmation']);
    analyticsService = jasmine.createSpyObj('AnalyticsService', [
      'trackPageView', 'trackFormStep', 'trackCompletedTransfer'
    ]);
    authService = jasmine.createSpyObj('AuthService', ['getToken', 'getCorrelationId']);
    authService.getToken.and.returnValue('mock-token');
    authService.getCorrelationId.and.returnValue('test-correlation-id');

    accountApi.getAccounts.and.returnValue(of(mockAccounts));

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TransferComponent],
      providers: [
        { provide: AccountApiClient, useValue: accountApi },
        { provide: TransferApiClient, useValue: transferApi },
        { provide: AuditLogService, useValue: auditLogService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: AuthService, useValue: authService },
        ChangeDetectorRef
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  function createComponent(): TransferComponent {
    const fixture = TestBed.createComponent(TransferComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();
    return comp;
  }

  it('should load accounts and create form groups on init', () => {
    component = createComponent();

    expect(component.accounts.length).toBe(2);
    expect(component.sourceFormGroup).toBeTruthy();
    expect(component.destinationFormGroup).toBeTruthy();
    expect(component.amountFormGroup).toBeTruthy();
  });

  it('should validate positive amount', () => {
    component = createComponent();

    component.amountFormGroup.get('amount')?.setValue('0');
    expect(component.amountFormGroup.get('amount')?.hasError('positiveAmount')).toBeTrue();

    component.amountFormGroup.get('amount')?.setValue('100');
    expect(component.amountFormGroup.get('amount')?.hasError('positiveAmount')).toBeFalse();
  });

  it('should validate daily limit', () => {
    component = createComponent();

    component.amountFormGroup.get('amount')?.setValue('15000');
    expect(component.amountFormGroup.get('amount')?.hasError('dailyLimit')).toBeTrue();

    component.amountFormGroup.get('amount')?.setValue('5000');
    expect(component.amountFormGroup.get('amount')?.hasError('dailyLimit')).toBeFalse();
  });

  it('should fire audit log on review step', () => {
    component = createComponent();

    component.sourceFormGroup.get('sourceAccountId')?.setValue('acct-chk-001');
    component.destinationFormGroup.get('destinationAccountId')?.setValue('acct-sav-001');
    component.amountFormGroup.get('amount')?.setValue('250');

    component.onReviewStep();

    expect(auditLogService.logTransferReview).toHaveBeenCalledWith(
      'authenticated-user',
      jasmine.objectContaining({
        sourceAccountId: 'acct-chk-001',
        destinationAccountId: 'acct-sav-001',
        amount: 250,
        currency: 'USD'
      })
    );
  });

  it('should fire audit log and analytics on successful transfer', () => {
    component = createComponent();
    component.stepper = { next: jasmine.createSpy('next') } as any;

    component.sourceFormGroup.get('sourceAccountId')?.setValue('acct-chk-001');
    component.destinationFormGroup.get('destinationAccountId')?.setValue('acct-sav-001');
    component.amountFormGroup.get('amount')?.setValue('100');

    const validationResult: TransferValidationResult = { valid: true, errors: [] };
    const transferResult: TransferResult = {
      success: true,
      confirmationNumber: 'TRF-123456',
      status: 'completed',
      estimatedCompletionDate: '2024-01-11',
      submittedAt: new Date().toISOString()
    };

    transferApi.validateTransfer.and.returnValue(of(validationResult));
    transferApi.submitTransfer.and.returnValue(of(transferResult));

    component.confirmTransfer();

    expect(auditLogService.logTransferConfirmation).toHaveBeenCalledWith(
      'authenticated-user',
      jasmine.objectContaining({ sourceAccountId: 'acct-chk-001', amount: 100 }),
      'TRF-123456'
    );
    expect(analyticsService.trackCompletedTransfer).toHaveBeenCalledWith(
      jasmine.objectContaining({ amount: 100, confirmationNumber: 'TRF-123456' })
    );
  });

  it('should show validation errors from transfer validation', () => {
    component = createComponent();

    component.sourceFormGroup.get('sourceAccountId')?.setValue('acct-chk-001');
    component.destinationFormGroup.get('destinationAccountId')?.setValue('acct-sav-001');
    component.amountFormGroup.get('amount')?.setValue('100');

    const validationResult: TransferValidationResult = {
      valid: false,
      errors: [{ field: 'amount', code: 'INSUFFICIENT_FUNDS', message: 'Not enough funds' }]
    };
    transferApi.validateTransfer.and.returnValue(of(validationResult));

    component.confirmTransfer();

    expect(component.transferError).toContain('Not enough funds');
    expect(component.submitting).toBeFalse();
  });

  it('should handle transfer API error', () => {
    component = createComponent();

    component.sourceFormGroup.get('sourceAccountId')?.setValue('acct-chk-001');
    component.destinationFormGroup.get('destinationAccountId')?.setValue('acct-sav-001');
    component.amountFormGroup.get('amount')?.setValue('100');

    transferApi.validateTransfer.and.returnValue(throwError(() => new Error('Network error')));

    component.confirmTransfer();

    expect(component.transferError).toContain('Unable to validate');
    expect(component.submitting).toBeFalse();
  });
});
