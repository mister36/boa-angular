import { NgModule } from '@angular/core';
import { AccountApiClient } from './services/account-api.client';
import { TransactionApiClient } from './services/transaction-api.client';
import { TransferApiClient } from './services/transfer-api.client';
import { BillPayApiClient } from './services/bill-pay-api.client';
import { ProviderErrorMapper } from './services/provider-error-mapper';

@NgModule({
  providers: [
    AccountApiClient,
    TransactionApiClient,
    TransferApiClient,
    BillPayApiClient,
    ProviderErrorMapper
  ]
})
export class FinancialDataModule {}
