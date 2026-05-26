import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PayeeCategory } from '@boa/financial-data';

@Component({
  selector: 'boa-add-payee-dialog',
  templateUrl: './add-payee-dialog.component.html',
  styleUrls: ['./add-payee-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPayeeDialogComponent {
  payeeForm: FormGroup;

  categories: PayeeCategory[] = [
    'utilities', 'telecommunications', 'insurance', 'housing', 'financial', 'subscription', 'other'
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddPayeeDialogComponent>
  ) {
    this.payeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nickname: [''],
      accountNumber: ['', [Validators.required, Validators.minLength(4)]],
      routingNumber: [''],
      category: ['other', Validators.required],
      isAutoPay: [false]
    });
  }

  submit(): void {
    if (this.payeeForm.valid) {
      this.dialogRef.close(this.payeeForm.value);
    }
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
