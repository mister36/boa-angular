import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Account } from '@boa/financial-data';

@Component({
  selector: 'boa-confirm-step',
  template: `
    <div class="step-content">
      <h3>Confirm Transfer</h3>

      <boa-alert-banner *ngIf="error" type="error" [dismissible]="false">
        {{ error }}
      </boa-alert-banner>

      <div class="confirm-summary">
        <p>You are about to transfer <strong>{{ amount | currency:'USD' }}</strong></p>
        <p *ngIf="sourceAccount">
          From: <strong>{{ sourceAccount.name }}</strong>
        </p>
        <p *ngIf="destinationAccount">
          To: <strong>{{ destinationAccount.name }}</strong>
        </p>
      </div>

      <div class="confirm-warning">
        <mat-icon>warning</mat-icon>
        <span>This action cannot be undone. Please confirm you wish to proceed.</span>
      </div>

      <button mat-raised-button color="warn"
              (click)="confirmed.emit()"
              [disabled]="submitting"
              class="confirm-button">
        <mat-icon *ngIf="!submitting">check_circle</mat-icon>
        {{ submitting ? 'Processing...' : 'Confirm Transfer' }}
      </button>
    </div>
  `,
  styles: [`
    .step-content { padding: 16px 0; }
    .confirm-summary {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 24px;
      margin: 16px 0;
    }
    .confirm-summary p { margin: 8px 0; font-size: 1.05rem; }
    .confirm-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #fff3e0;
      border-radius: 4px;
      margin: 16px 0;
      color: #e65100;
    }
    .confirm-button { margin-top: 16px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmStepComponent {
  @Input() sourceAccount: Account | undefined;
  @Input() destinationAccount: Account | undefined;
  @Input() amount = 0;
  @Input() submitting = false;
  @Input() error: string | null = null;
  @Output() confirmed = new EventEmitter<void>();
}
