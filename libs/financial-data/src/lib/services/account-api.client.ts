import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { Account, AccountBalanceSummary } from '../models/account.models';
import { ProviderError } from '../models/transfer.models';
import { MOCK_ACCOUNTS } from '../mock-data/accounts.mock';

@Injectable()
export class AccountApiClient {

  private readonly simulatedLatencyMs = 400;

  getAccounts(): Observable<Account[]> {
    return of([...MOCK_ACCOUNTS]).pipe(
      delay(this.simulatedLatencyMs)
    );
  }

  getAccountById(accountId: string): Observable<Account> {
    if (accountId === 'ERROR-001') {
      return this.simulateProviderOutage();
    }

    const account = MOCK_ACCOUNTS.find(a => a.id === accountId);
    if (!account) {
      return throwError(() => this.createProviderError(
        'INVALID_ACCOUNT',
        `Account ${accountId} not found in provider system`
      ));
    }

    return of({ ...account }).pipe(
      delay(this.simulatedLatencyMs)
    );
  }

  getBalance(accountId: string): Observable<AccountBalanceSummary> {
    if (accountId === 'ERROR-001') {
      return this.simulateProviderOutage();
    }

    const account = MOCK_ACCOUNTS.find(a => a.id === accountId);
    if (!account) {
      return throwError(() => this.createProviderError(
        'INVALID_ACCOUNT',
        `Account ${accountId} not found`
      ));
    }

    const summary: AccountBalanceSummary = {
      accountId: account.id,
      availableBalance: account.availableBalance,
      currentBalance: account.currentBalance,
      asOfDate: new Date().toISOString().split('T')[0]
    };

    return of(summary).pipe(
      delay(this.simulatedLatencyMs / 2)
    );
  }

  getAccountsByType(type: string): Observable<Account[]> {
    const accounts = MOCK_ACCOUNTS.filter(a => a.type === type);
    return of([...accounts]).pipe(
      delay(this.simulatedLatencyMs)
    );
  }

  private simulateProviderOutage(): Observable<never> {
    return timer(3000).pipe(
      switchMap(() => throwError(() => this.createProviderError(
        'PROVIDER_TIMEOUT',
        'Connection to financial provider timed out after 3000ms'
      )))
    );
  }

  private createProviderError(code: string, technicalMessage: string): ProviderError {
    return {
      code,
      technicalMessage,
      providerReference: `PRV-${Date.now()}`,
      retryable: code === 'PROVIDER_TIMEOUT'
    };
  }
}
