import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'boa-money-display',
  templateUrl: './money-display.component.html',
  styleUrls: ['./money-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoneyDisplayComponent {
  @Input() amount = 0;
  @Input() currency = 'USD';
  @Input() masked = false;
  @Input() compact = false;
  @Input() showSign = false;

  get isNegative(): boolean {
    return this.amount < 0;
  }

  get formattedAmount(): string {
    if (this.masked) {
      return '****';
    }

    const absAmount = Math.abs(this.amount);

    if (this.compact) {
      return this.formatCompact(absAmount);
    }

    const formatted = absAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    if (this.isNegative) {
      return '-' + formatted;
    }
    if (this.showSign && this.amount > 0) {
      return '+' + formatted;
    }
    return formatted;
  }

  private formatCompact(value: number): string {
    const symbol = this.currency === 'USD' ? '$' : '';
    if (value >= 1_000_000) {
      return symbol + (value / 1_000_000).toFixed(1) + 'M';
    }
    if (value >= 1_000) {
      return symbol + (value / 1_000).toFixed(1) + 'K';
    }
    return symbol + value.toFixed(2);
  }
}
