import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { Transaction, TransactionFilter, TransactionExportResult } from '../models/transaction.models';
import { ProviderError } from '../models/transfer.models';
import { MOCK_TRANSACTIONS } from '../mock-data/transactions.mock';

@Injectable()
export class TransactionApiClient {

  private readonly simulatedLatencyMs = 500;

  getTransactions(filter?: TransactionFilter): Observable<Transaction[]> {
    if (filter?.accountId === 'ERROR-001') {
      return this.simulateProviderOutage();
    }

    let transactions = [...MOCK_TRANSACTIONS];

    if (filter) {
      transactions = this.applyFilter(transactions, filter);
    }

    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return of(transactions).pipe(
      delay(this.simulatedLatencyMs)
    );
  }

  getTransactionById(transactionId: string): Observable<Transaction> {
    const transaction = MOCK_TRANSACTIONS.find(t => t.id === transactionId);
    if (!transaction) {
      return throwError(() => this.createProviderError(
        'INVALID_ACCOUNT',
        `Transaction ${transactionId} not found`
      ));
    }

    return of({ ...transaction }).pipe(
      delay(this.simulatedLatencyMs / 2)
    );
  }

  getTransactionsByAccount(accountId: string): Observable<Transaction[]> {
    if (accountId === 'ERROR-001') {
      return this.simulateProviderOutage();
    }

    const transactions = MOCK_TRANSACTIONS
      .filter(t => t.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return of([...transactions]).pipe(
      delay(this.simulatedLatencyMs)
    );
  }

  exportTransactions(filter?: TransactionFilter): Observable<TransactionExportResult> {
    let transactions = [...MOCK_TRANSACTIONS];
    if (filter) {
      transactions = this.applyFilter(transactions, filter);
    }

    const result: TransactionExportResult = {
      success: true,
      filename: `transactions_export_${new Date().toISOString().split('T')[0]}.csv`,
      recordCount: transactions.length
    };

    return of(result).pipe(
      delay(800)
    );
  }

  private applyFilter(transactions: Transaction[], filter: TransactionFilter): Transaction[] {
    let result = transactions;

    if (filter.accountId) {
      result = result.filter(t => t.accountId === filter.accountId);
    }

    if (filter.startDate) {
      result = result.filter(t => t.date >= filter.startDate!);
    }

    if (filter.endDate) {
      result = result.filter(t => t.date <= filter.endDate!);
    }

    if (filter.type) {
      result = result.filter(t => t.type === filter.type);
    }

    if (filter.category) {
      result = result.filter(t => t.category === filter.category);
    }

    if (filter.status) {
      result = result.filter(t => t.status === filter.status);
    }

    if (filter.minAmount !== undefined) {
      result = result.filter(t => Math.abs(t.amount) >= filter.minAmount!);
    }

    if (filter.maxAmount !== undefined) {
      result = result.filter(t => Math.abs(t.amount) <= filter.maxAmount!);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(term) ||
        (t.merchantName && t.merchantName.toLowerCase().includes(term))
      );
    }

    return result;
  }

  private simulateProviderOutage(): Observable<never> {
    return timer(3000).pipe(
      switchMap(() => throwError(() => this.createProviderError(
        'PROVIDER_TIMEOUT',
        'Transaction provider connection timed out'
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
