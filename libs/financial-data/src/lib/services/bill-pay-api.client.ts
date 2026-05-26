import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Payee,
  BillPaymentRequest,
  BillPaymentResult,
  ProviderError
} from '../models/transfer.models';
import { MOCK_PAYEES } from '../mock-data/payees.mock';
import { MOCK_ACCOUNTS } from '../mock-data/accounts.mock';

@Injectable()
export class BillPayApiClient {

  private readonly simulatedLatencyMs = 500;
  private payees: Payee[] = [...MOCK_PAYEES];
  private paymentCounter = 5000;

  getPayees(): Observable<Payee[]> {
    return of([...this.payees]).pipe(
      delay(this.simulatedLatencyMs)
    );
  }

  getPayeeById(payeeId: string): Observable<Payee> {
    const payee = this.payees.find(p => p.id === payeeId);
    if (!payee) {
      return throwError(() => this.createProviderError(
        'PAYEE_NOT_FOUND',
        `Payee ${payeeId} not found`
      ));
    }

    return of({ ...payee }).pipe(
      delay(this.simulatedLatencyMs / 2)
    );
  }

  addPayee(payee: Omit<Payee, 'id' | 'lastPaymentDate' | 'lastPaymentAmount'>): Observable<Payee> {
    const newPayee: Payee = {
      ...payee,
      id: `payee-${String(this.payees.length + 1).padStart(3, '0')}`,
      lastPaymentDate: undefined,
      lastPaymentAmount: undefined
    };

    this.payees = [...this.payees, newPayee];

    return of(newPayee).pipe(
      delay(this.simulatedLatencyMs)
    );
  }

  submitPayment(request: BillPaymentRequest): Observable<BillPaymentResult> {
    const payee = this.payees.find(p => p.id === request.payeeId);
    if (!payee) {
      return of<BillPaymentResult>({
        success: false,
        error: this.createProviderError(
          'PAYEE_NOT_FOUND',
          `Payee ${request.payeeId} not found in system`
        )
      }).pipe(delay(this.simulatedLatencyMs));
    }

    const sourceAccount = MOCK_ACCOUNTS.find(a => a.id === request.sourceAccountId);
    if (!sourceAccount) {
      return of<BillPaymentResult>({
        success: false,
        error: this.createProviderError(
          'INVALID_ACCOUNT',
          `Source account ${request.sourceAccountId} not found`
        )
      }).pipe(delay(this.simulatedLatencyMs));
    }

    if (request.amount <= 0) {
      return of<BillPaymentResult>({
        success: false,
        error: this.createProviderError(
          'INVALID_AMOUNT',
          'Payment amount must be greater than zero'
        )
      }).pipe(delay(this.simulatedLatencyMs));
    }

    if (request.amount > sourceAccount.availableBalance) {
      return of<BillPaymentResult>({
        success: false,
        error: this.createProviderError(
          'INSUFFICIENT_FUNDS',
          `Insufficient funds: available ${sourceAccount.availableBalance}, requested ${request.amount}`
        )
      }).pipe(delay(this.simulatedLatencyMs));
    }

    this.paymentCounter++;
    const confirmationNumber = `BPY-${Date.now().toString(36).toUpperCase()}-${this.paymentCounter}`;

    const result: BillPaymentResult = {
      success: true,
      confirmationNumber,
      scheduledDate: request.scheduledDate
    };

    return of(result).pipe(
      delay(this.simulatedLatencyMs)
    );
  }

  private createProviderError(code: string, technicalMessage: string): ProviderError {
    return {
      code,
      technicalMessage,
      providerReference: `PRV-${Date.now()}`,
      retryable: false
    };
  }
}
