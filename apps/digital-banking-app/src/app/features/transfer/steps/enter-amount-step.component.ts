import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Account } from '@boa/financial-data';

@Component({
  selector: 'boa-enter-amount-step',
  template: `
    <div class="step-content" [formGroup]="formGroup">
      <h3>Enter Transfer Amount</h3>
      <p class="step-description" *ngIf="sourceAccount">
        Available balance: {{ sourceAccount.availableBalance | currency:'USD' }}
      </p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Amount (USD)</mat-label>
        <span matPrefix>$ &nbsp;</span>
        <input matInput formControlName="amount" type="number" step="0.01" min="0.01">
        <mat-error *ngIf="formGroup.get('amount')?.hasError('required')">
          Amount is required
        </mat-error>
        <mat-error *ngIf="formGroup.get('amount')?.hasError('positiveAmount')">
          Amount must be greater than zero
        </mat-error>
        <mat-error *ngIf="formGroup.get('amount')?.hasError('dailyLimit')">
          {{ formGroup.get('amount')?.getError('dailyLimit').message }}
        </mat-error>
        <mat-error *ngIf="formGroup.get('amount')?.hasError('insufficientFunds')">
          Insufficient funds in source account
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Memo (optional)</mat-label>
        <input matInput formControlName="memo" maxlength="100">
        <mat-hint align="end">{{ formGroup.get('memo')?.value?.length || 0 }}/100</mat-hint>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .step-content { padding: 16px 0; }
    .step-description { color: #666; margin-bottom: 24px; }
    .full-width { width: 100%; margin-bottom: 16px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EnterAmountStepComponent {
  @Input() formGroup!: FormGroup;
  @Input() sourceAccount: Account | undefined;
}
