// Module
export { FinancialDataModule } from './lib/financial-data.module';

// Services
export { AccountApiClient } from './lib/services/account-api.client';
export { TransactionApiClient } from './lib/services/transaction-api.client';
export { TransferApiClient } from './lib/services/transfer-api.client';
export { BillPayApiClient } from './lib/services/bill-pay-api.client';
export { ProviderErrorMapper } from './lib/services/provider-error-mapper';

// Account Models
export {
  Account,
  AccountType,
  AccountStatus,
  AccountBalanceSummary
} from './lib/models/account.models';

// Transaction Models
export {
  Transaction,
  TransactionType,
  TransactionCategory,
  TransactionStatus,
  TransactionFilter,
  TransactionExportResult
} from './lib/models/transaction.models';

// Transfer Models
export {
  TransferRequest,
  TransferResult,
  TransferStatus,
  TransferValidationResult,
  TransferValidationError,
  ProviderError,
  Payee,
  PayeeCategory,
  BillPaymentRequest,
  BillPaymentResult
} from './lib/models/transfer.models';

// Provider Error Models
export {
  ProviderErrorCode,
  UserFriendlyError,
  PROVIDER_ERROR_MAP
} from './lib/models/provider-error.models';
