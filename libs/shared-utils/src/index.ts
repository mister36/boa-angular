// Module
export { SharedUtilsModule } from './lib/shared-utils.module';

// Formatting
export { formatCurrency, parseCurrency, CurrencyFormatOptions } from './lib/formatting/currency.util';
export { formatDate, formatRelativeDate, parseISODate, isValidDateRange, DateFormatStyle } from './lib/formatting/date.util';

// Masking
export { maskAccountNumber, maskRoutingNumber, maskCreditCardNumber, getLastFourDigits } from './lib/masking/account-masking.util';
export { redactEmail, redactPhone, redactSsn, redactPii } from './lib/masking/pii-redaction.util';

// Identifiers
export { generateCorrelationId, isValidCorrelationId } from './lib/identifiers/correlation-id.util';

// Errors
export { normalizeError, isNetworkError, isHttpError, NormalizedError } from './lib/errors/error-normalization.util';

// Config
export { EnvironmentConfigService, EnvironmentConfig } from './lib/config/environment-config.util';
