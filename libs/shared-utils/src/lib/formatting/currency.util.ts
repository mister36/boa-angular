export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  showSymbol?: boolean;
  compact?: boolean;
  masked?: boolean;
}

const DEFAULT_OPTIONS: CurrencyFormatOptions = {
  locale: 'en-US',
  currency: 'USD',
  showSymbol: true,
  compact: false,
  masked: false
};

export function formatCurrency(amount: number, options?: Partial<CurrencyFormatOptions>): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.masked) {
    return opts.showSymbol ? '$****' : '****';
  }

  if (opts.compact) {
    return formatCompact(amount, opts);
  }

  const formatted = new Intl.NumberFormat(opts.locale, {
    style: opts.showSymbol ? 'currency' : 'decimal',
    currency: opts.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount));

  if (amount < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

export function parseCurrency(value: string): number | null {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/[^0-9.\-]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

function formatCompact(amount: number, opts: CurrencyFormatOptions): string {
  const abs = Math.abs(amount);
  let formatted: string;

  if (abs >= 1_000_000) {
    formatted = `${(abs / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    formatted = `${(abs / 1_000).toFixed(1)}K`;
  } else {
    formatted = abs.toFixed(2);
  }

  const prefix = opts.showSymbol ? '$' : '';
  const sign = amount < 0 ? '-' : '';

  return `${sign}${prefix}${formatted}`;
}
