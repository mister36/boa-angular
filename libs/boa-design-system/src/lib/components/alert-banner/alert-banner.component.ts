import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'boa-alert-banner',
  templateUrl: './alert-banner.component.html',
  styleUrls: ['./alert-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertBannerComponent {
  @Input() type: 'info' | 'warning' | 'error' | 'success' = 'info';
  @Input() dismissible = true;
  @Input() icon = '';

  @Output() dismissed = new EventEmitter<void>();

  visible = true;

  get effectiveIcon(): string {
    if (this.icon) {
      return this.icon;
    }
    const defaults: Record<string, string> = {
      info: 'info_outline',
      warning: 'warning',
      error: 'error',
      success: 'check_circle'
    };
    return defaults[this.type] || 'info_outline';
  }

  dismiss(): void {
    this.visible = false;
    this.dismissed.emit();
  }
}
