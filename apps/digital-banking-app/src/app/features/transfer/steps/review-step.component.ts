import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Account } from '@boa/financial-data';

@Component({
  selector: 'boa-review-step',
  template: `
    <div class="step-content">
      <h3>Review Transfer</h3>
      <p class="step-description">Please verify the transfer details below.</p>

      <div class="review-card">
        <div class="review-row">
          <span class="review-label">From</span>
          <span class="review-value" *ngIf="sourceAccount">
            {{ sourceAccount.name }} (****{{ sourceAccount.accountNumber | slice:-4 }})
          </span>
        </div>

        <mat-divider></mat-divider>

        <div class="review-row">
          <span class="review-label">To</span>
          <span class="review-value" *ngIf="destinationAccount">
            {{ destinationAccount.name }} (****{{ destinationAccount.accountNumber | slice:-4 }})
          </span>
        </div>

        <mat-divider></mat-divider>

        <div class="review-row">
          <span class="review-label">Amount</span>
          <span class="review-value amount">{{ amount | currency:'USD' }}</span>
        </div>

        <mat-divider *ngIf="memo"></mat-divider>

        <div class="review-row" *ngIf="memo">
          <span class="review-label">Memo</span>
          <span class="review-value">{{ memo }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-content { padding: 16px 0; }
    .step-description { color: #666; margin-bottom: 24px; }
    .review-card {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 24px;
    }
    .review-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }
    .review-label {
      font-size: 0.9rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .review-value {
      font-weight: 500;
      font-size: 1rem;
    }
    .review-value.amount {
      font-size: 1.25rem;
      color: #012169;
    }
    mat-divider { margin: 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewStepComponent implements OnInit {
  @Input() sourceAccount: Account | undefined;
  @Input() destinationAccount: Account | undefined;
  @Input() amount = 0;
  @Input() memo = '';
  @Output() reviewed = new EventEmitter<void>();

  ngOnInit(): void {
    this.reviewed.emit();
  }
}
