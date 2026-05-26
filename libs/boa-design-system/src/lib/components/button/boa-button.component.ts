import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'boa-button',
  templateUrl: './boa-button.component.html',
  styleUrls: ['./boa-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoaButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() icon = '';

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }
}
