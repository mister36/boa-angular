import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'boa-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  styleUrls: ['./dialog-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogWrapperComponent {
  @Input() title = '';
  @Input() showClose = true;
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() showCancel = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor(@Optional() private dialogRef: MatDialogRef<any>) {}

  onClose(): void {
    this.cancel.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
