export interface FlagConfig {
  name: string;
  enabled: boolean;
  description?: string;
  lastModified?: string;
}

export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  'new-transfer-flow': false,
  'new-dashboard-card': false,
  'provider-fallback': true,
  'angular18-migrated-behavior': false,
  'enhanced-security-alerts': true,
  'bill-pay-scheduled-payments': true,
  'transaction-export-csv': true,
  'dark-mode': false
};

export const FEATURE_FLAG_DESCRIPTIONS: Record<string, string> = {
  'new-transfer-flow': 'Enable redesigned multi-step transfer flow',
  'new-dashboard-card': 'Enable new account summary card layout on dashboard',
  'provider-fallback': 'Enable fallback to secondary financial provider on timeout',
  'angular18-migrated-behavior': 'Enable Angular 18 migrated component behavior',
  'enhanced-security-alerts': 'Show enhanced security alert banners',
  'bill-pay-scheduled-payments': 'Enable scheduled bill payments feature',
  'transaction-export-csv': 'Enable CSV export for transaction history',
  'dark-mode': 'Enable dark mode theme (experimental)'
};
