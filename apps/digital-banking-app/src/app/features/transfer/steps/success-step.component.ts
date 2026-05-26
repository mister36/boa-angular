import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TransferResult } from '@boa/financial-data';

@Component({
  selector: 'boa-success-step',
  template: `
    <div class="step-content" *ngIf="result">
      <div class="success-icon">
        <mat-icon>check_circle</mat-icon>
      </div>

      <h3>Transfer Successful!</h3>
      <p class="success-message">Your transfer has been submitted and is being processed.</p>

      <div class="receipt-card">
        <div class="receipt-row">
          <span class="receipt-label">Confirmation Number</span>
          <span class="receipt-value mono">{{ result.confirmationNumber }}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Status</span>
          <span class="receipt-value">{{ result.status | titlecase }}</span>
        </div>
        <div class="receipt-row" *ngIf="result.estimatedCompletionDate">
          <span class="receipt-label">Estimated Completion</span>
          <span class="receipt-value">{{ result.estimatedCompletionDate }}</span>
        </div>
        <div class="receipt-row" *ngIf="result.submittedAt">
          <span class="receipt-label">Submitted At</span>
          <span class="receipt-value">{{ result.submittedAt }}</span>
        </div>
      </div>

      <div class="success-actions">
        <a mat-raised-button color="primary" routerLink="/dashboard">
          Return to Dashboard
        </a>
        <a mat-button routerLink="/transactions">
          View Transactions
        </a>
      </div>
    </div>
  `,
  styles: [`
    .step-content { padding: 16px 0; text-align: center; }
    .success-icon {
      margin-bottom: 16px;
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #388e3c;
      }
    }
    .success-message { color: #666; margin-bottom: 24px; }
    .receipt-card {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 24px;
      text-align: left;
      margin: 24px 0;
    }
    .receipt-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
      &:last-child { border-bottom: none; }
    }
    .receipt-label { color: #666; font-size: 0.9rem; }
    .receipt-value { font-weight: 500; }
    .receipt-value.mono { font-family: 'Courier New', monospace; }
    .success-actions { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessStepComponent {
  @Input() result: TransferResult | null = null;
}
