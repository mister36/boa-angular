import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import {
  AccountApiClient,
  TransferApiClient,
  Account,
  TransferRequest,
  TransferResult
} from '@boa/financial-data';
import { AuditLogService } from '@boa/audit-logging';
import { AnalyticsService } from '@boa/analytics';
import { AuthService } from '@boa/auth';
import { positiveAmountValidator, withinDailyLimitValidator } from './validators/transfer.validators';

@Component({
  selector: 'boa-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  sourceFormGroup!: FormGroup;
  destinationFormGroup!: FormGroup;
  amountFormGroup!: FormGroup;

  accounts: Account[] = [];
  loading = true;
  submitting = false;
  transferResult: TransferResult | null = null;
  transferError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private accountApi: AccountApiClient,
    private transferApi: TransferApiClient,
    private auditLogService: AuditLogService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.analyticsService.trackPageView('/transfer');

    this.sourceFormGroup = this.fb.group({
      sourceAccountId: ['', Validators.required]
    });

    this.destinationFormGroup = this.fb.group({
      destinationAccountId: ['', Validators.required]
    });

    this.amountFormGroup = this.fb.group({
      amount: ['', [Validators.required, positiveAmountValidator(), withinDailyLimitValidator()]],
      memo: ['']
    });

    this.loadAccounts();
  }

  get sourceAccount(): Account | undefined {
    return this.accounts.find(a => a.id === this.sourceFormGroup.value.sourceAccountId);
  }

  get destinationAccount(): Account | undefined {
    return this.accounts.find(a => a.id === this.destinationFormGroup.value.destinationAccountId);
  }

  get availableDestinations(): Account[] {
    const sourceId = this.sourceFormGroup.value.sourceAccountId;
    return this.accounts.filter(a => a.id !== sourceId && a.type !== 'credit_card' && a.type !== 'loan');
  }

  get transferAmount(): number {
    return parseFloat(this.amountFormGroup.value.amount) || 0;
  }

  onStepChange(event: { selectedIndex: number }): void {
    this.analyticsService.trackFormStep('transfer', event.selectedIndex);
  }

  onReviewStep(): void {
    const userId = this.authService.getToken() ? 'authenticated-user' : null;
    this.auditLogService.logTransferReview(userId, {
      sourceAccountId: this.sourceFormGroup.value.sourceAccountId,
      destinationAccountId: this.destinationFormGroup.value.destinationAccountId,
      amount: this.transferAmount,
      currency: 'USD'
    });
  }

  confirmTransfer(): void {
    this.submitting = true;
    this.transferError = null;

    const request: TransferRequest = {
      sourceAccountId: this.sourceFormGroup.value.sourceAccountId,
      destinationAccountId: this.destinationFormGroup.value.destinationAccountId,
      amount: this.transferAmount,
      memo: this.amountFormGroup.value.memo || undefined
    };

    this.transferApi.validateTransfer(request).subscribe({
      next: (validation) => {
        if (!validation.valid) {
          this.transferError = validation.errors.map(e => e.message).join('. ');
          this.submitting = false;
          this.cdr.markForCheck();
          return;
        }

        this.transferApi.submitTransfer(request).subscribe({
          next: (result) => {
            this.transferResult = result;
            this.submitting = false;

            if (result.success) {
              const userId = this.authService.getToken() ? 'authenticated-user' : null;
              this.auditLogService.logTransferConfirmation(userId, {
                sourceAccountId: request.sourceAccountId,
                destinationAccountId: request.destinationAccountId,
                amount: request.amount,
                currency: 'USD'
              }, result.confirmationNumber!);

              this.analyticsService.trackCompletedTransfer({
                amount: request.amount,
                confirmationNumber: result.confirmationNumber
              });

              this.stepper.next();
            } else {
              this.transferError = result.error?.technicalMessage || 'Transfer failed. Please try again.';
            }

            this.cdr.markForCheck();
          },
          error: (err) => {
            this.transferError = 'An unexpected error occurred during the transfer.';
            this.submitting = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.transferError = 'Unable to validate transfer. Please try again.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  private loadAccounts(): void {
    this.accountApi.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(a => a.status === 'active');
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
