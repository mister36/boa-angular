import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Transaction } from '@boa/financial-data';

@Component({
  selector: 'boa-transaction-detail-dialog',
  templateUrl: './transaction-detail-dialog.component.html',
  styleUrls: ['./transaction-detail-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TransactionDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public transaction: Transaction
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
