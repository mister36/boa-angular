import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Account } from '@boa/financial-data';

@Component({
  selector: 'boa-select-destination-step',
  template: `
    <div class="step-content" [formGroup]="formGroup">
      <h3>Select Destination Account</h3>
      <p class="step-description">Choose the account to transfer funds to.</p>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>To Account</mat-label>
        <mat-select formControlName="destinationAccountId">
          <mat-option *ngFor="let account of accounts" [value]="account.id">
            {{ account.name }} (****{{ account.accountNumber | slice:-4 }})
          </mat-option>
        </mat-select>
        <mat-error *ngIf="formGroup.get('destinationAccountId')?.hasError('required')">
          Please select a destination account
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
export class SelectDestinationStepComponent {
  @Input() formGroup!: FormGroup;
  @Input() accounts: Account[] = [];
}
