import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  AccountApiClient,
  BillPayApiClient,
  Account,
  Payee,
  BillPaymentRequest,
  BillPaymentResult,
  ProviderError
} from '@boa/financial-data';
import { AuditLogService } from '@boa/audit-logging';
import { AnalyticsService } from '@boa/analytics';
import { AuthService } from '@boa/auth';
import { AddPayeeDialogComponent } from './add-payee-dialog/add-payee-dialog.component';

type BillPayState = 'list' | 'payment' | 'review' | 'success' | 'error';

@Component({
  selector: 'boa-bill-pay',
  templateUrl: './bill-pay.component.html',
  styleUrls: ['./bill-pay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillPayComponent implements OnInit {
  payees: Payee[] = [];
  accounts: Account[] = [];
  loading = true;
  state: BillPayState = 'list';
  paymentForm!: FormGroup;
  selectedPayee: Payee | null = null;
  paymentResult: BillPaymentResult | null = null;
  submitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private billPayApi: BillPayApiClient,
    private accountApi: AccountApiClient,
    private auditLogService: AuditLogService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.analyticsService.trackPageView('/bill-pay');

    this.paymentForm = this.fb.group({
      sourceAccountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      scheduledDate: [new Date(), Validators.required],
      memo: ['']
    });

    this.loadData();
  }

  selectPayee(payee: Payee): void {
    this.selectedPayee = payee;
    this.state = 'payment';
    if (payee.lastPaymentAmount) {
      this.paymentForm.patchValue({ amount: payee.lastPaymentAmount });
    }
  }

  goToReview(): void {
    if (this.paymentForm.valid) {
      this.state = 'review';
      this.cdr.markForCheck();
    }
  }

  goBack(): void {
    if (this.state === 'review') {
      this.state = 'payment';
    } else if (this.state === 'payment') {
      this.state = 'list';
      this.selectedPayee = null;
      this.paymentForm.reset({ scheduledDate: new Date() });
    }
    this.cdr.markForCheck();
  }

  submitPayment(): void {
    if (!this.selectedPayee) return;

    this.submitting = true;
    this.error = null;

    const formValue = this.paymentForm.value;
    const request: BillPaymentRequest = {
      payeeId: this.selectedPayee.id,
      sourceAccountId: formValue.sourceAccountId,
      amount: parseFloat(formValue.amount),
      scheduledDate: this.formatDate(formValue.scheduledDate),
      memo: formValue.memo || undefined
    };

    this.billPayApi.submitPayment(request).subscribe({
      next: (result) => {
        this.paymentResult = result;
        this.submitting = false;

        if (result.success) {
          const userId = this.authService.getToken() ? 'authenticated-user' : null;
          this.auditLogService.logBillPayConfirmation(userId, {
            payeeId: request.payeeId,
            payeeName: this.selectedPayee!.name,
            amount: request.amount,
            sourceAccountId: request.sourceAccountId,
            scheduledDate: request.scheduledDate,
            confirmationNumber: result.confirmationNumber!
          });
          this.analyticsService.trackCompletedBillPay({
            payeeName: this.selectedPayee!.name,
            amount: request.amount,
            confirmationNumber: result.confirmationNumber
          });
          this.state = 'success';
        } else {
          this.error = result.error?.technicalMessage || 'Payment failed. Please try again.';
          this.state = 'error';
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'An unexpected error occurred. Please try again.';
        this.submitting = false;
        this.state = 'error';
        this.cdr.markForCheck();
      }
    });
  }

  openAddPayeeDialog(): void {
    const dialogRef = this.dialog.open(AddPayeeDialogComponent, {
      width: '450px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.billPayApi.addPayee(result).subscribe({
          next: (newPayee) => {
            this.payees = [...this.payees, newPayee];
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  resetToList(): void {
    this.state = 'list';
    this.selectedPayee = null;
    this.paymentResult = null;
    this.error = null;
    this.paymentForm.reset({ scheduledDate: new Date() });
    this.cdr.markForCheck();
  }

  private loadData(): void {
    this.billPayApi.getPayees().subscribe({
      next: (payees) => {
        this.payees = payees;
        this.cdr.markForCheck();
      }
    });

    this.accountApi.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(a => a.status === 'active' && (a.type === 'checking' || a.type === 'savings'));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
