import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Account } from '@boa/financial-data';

@Component({
  selector: 'boa-select-source-step',
  template: `
    <div class="step-content" [formGroup]="formGroup">
      <h3>Select Source Account</h3>
      <p class="step-description">Choose the account to transfer funds from.</p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>From Account</mat-label>
        <mat-select formControlName="sourceAccountId">
          <mat-option *ngFor="let account of accounts" [value]="account.id">
            {{ account.name }} (****{{ account.accountNumber | slice:-4 }}) -
            Available: {{ account.availableBalance | currency:'USD' }}
          </mat-option>
        </mat-select>
        <mat-error *ngIf="formGroup.get('sourceAccountId')?.hasError('required')">
          Please select a source account
        </mat-error>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .step-content { padding: 16px 0; }
    .step-description { color: #666; margin-bottom: 24px; }
    .full-width { width: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSourceStepComponent {
  @Input() formGroup!: FormGroup;
  @Input() accounts: Account[] = [];
}
