import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'boa-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountCardComponent {
  @Input() accountName = '';
  @Input() accountNumber = '';
  @Input() balance = 0;
  @Input() accountType: 'checking' | 'savings' | 'credit' | 'loan' = 'checking';
  @Input() status: 'active' | 'frozen' | 'closed' = 'active';

  @Output() cardClick = new EventEmitter<void>();

  get maskedNumber(): string {
    if (!this.accountNumber || this.accountNumber.length < 4) {
      return this.accountNumber;
    }
    return '****' + this.accountNumber.slice(-4);
  }

  get accountIcon(): string {
    const icons: Record<string, string> = {
      checking: 'account_balance',
      savings: 'savings',
      credit: 'credit_card',
      loan: 'request_quote'
    };
    return icons[this.accountType] || 'account_balance';
  }

  get statusClass(): string {
    return `status-badge--${this.status}`;
  }

  onClick(): void {
    this.cardClick.emit();
  }
}
