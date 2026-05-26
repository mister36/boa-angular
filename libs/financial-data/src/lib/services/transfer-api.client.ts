import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  TransferRequest,
  TransferResult,
  TransferValidationResult,
  TransferValidationError,
  ProviderError
} from '../models/transfer.models';
import { MOCK_ACCOUNTS } from '../mock-data/accounts.mock';

@Injectable()
export class TransferApiClient {

  private readonly simulatedLatencyMs = 600;
  private transferCounter = 1000;

  validateTransfer(request: TransferRequest): Observable<TransferValidationResult> {
    const errors: TransferValidationError[] = [];

    const sourceAccount = MOCK_ACCOUNTS.find(a => a.id === request.sourceAccountId);
    const destAccount = MOCK_ACCOUNTS.find(a => a.id === request.destinationAccountId);

    if (!sourceAccount) {
      errors.push({
        field: 'sourceAccountId',
        code: 'INVALID_ACCOUNT',
        message: 'Source account not found'
      });
    }

    if (!destAccount) {
      errors.push({
        field: 'destinationAccountId',
        code: 'INVALID_ACCOUNT',
        message: 'Destination account not found'
      });
    }

    if (request.sourceAccountId === request.destinationAccountId) {
      errors.push({
        field: 'destinationAccountId',
        code: 'SAME_ACCOUNT',
        message: 'Source and destination accounts must be different'
      });
    }

    if (request.amount <= 0) {
      errors.push({
        field: 'amount',
        code: 'INVALID_AMOUNT',
        message: 'Transfer amount must be greater than zero'
      });
    }

    if (request.amount > 10000) {
      errors.push({
        field: 'amount',
        code: 'TRANSFER_LIMIT_EXCEEDED',
        message: 'Transfer amount exceeds the $10,000 daily limit'
      });
    }

    if (sourceAccount && request.amount > sourceAccount.availableBalance) {
      errors.push({
        field: 'amount',
        code: 'INSUFFICIENT_FUNDS',
        message: 'Insufficient funds in source account'
      });
    }

    if (sourceAccount && sourceAccount.status === 'frozen') {
      errors.push({
        field: 'sourceAccountId',
        code: 'ACCOUNT_FROZEN',
        message: 'Source account is currently frozen'
      });
    }

    const result: TransferValidationResult = {
      valid: errors.length === 0,
      errors
    };

    return of(result).pipe(
      delay(this.simulatedLatencyMs / 2)
    );
  }

  submitTransfer(request: TransferRequest): Observable<TransferResult> {
    if (request.amount === 99999) {
      return of<TransferResult>({
        success: false,
        error: this.createProviderError(
          'INSUFFICIENT_FUNDS',
          'Provider rejected: insufficient funds for amount 99999'
        )
      }).pipe(delay(this.simulatedLatencyMs));
    }

    if (request.amount === 88888) {
      return of<TransferResult>({
        success: false,
        error: this.createProviderError(
          'PROVIDER_TIMEOUT',
          'Provider connection timed out during transfer submission'
        )
      }).pipe(delay(3000));
    }

    const sourceAccount = MOCK_ACCOUNTS.find(a => a.id === request.sourceAccountId);
    if (sourceAccount && request.amount > sourceAccount.availableBalance) {
      return of<TransferResult>({
        success: false,
        error: this.createProviderError(
          'INSUFFICIENT_FUNDS',
          `Available balance ${sourceAccount.availableBalance} less than transfer amount ${request.amount}`
        )
      }).pipe(delay(this.simulatedLatencyMs));
    }

    this.transferCounter++;
    const confirmationNumber = `TRF-${Date.now().toString(36).toUpperCase()}-${this.transferCounter}`;

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + 1);

    const result: TransferResult = {
      success: true,
      confirmationNumber,
      status: 'processing',
      estimatedCompletionDate: completionDate.toISOString().split('T')[0],
      submittedAt: new Date().toISOString()
    };

    return of(result).pipe(
      delay(this.simulatedLatencyMs)
    );
  }

  getTransferStatus(confirmationNumber: string): Observable<TransferResult> {
    const result: TransferResult = {
      success: true,
      confirmationNumber,
      status: 'completed',
      estimatedCompletionDate: new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString()
    };

    return of(result).pipe(
      delay(this.simulatedLatencyMs / 2)
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
