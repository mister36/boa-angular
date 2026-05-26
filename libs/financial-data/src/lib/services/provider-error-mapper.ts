import { Injectable } from '@angular/core';
import { ProviderError } from '../models/transfer.models';
import { ProviderErrorCode, UserFriendlyError, PROVIDER_ERROR_MAP } from '../models/provider-error.models';

@Injectable()
export class ProviderErrorMapper {

  mapError(error: ProviderError): UserFriendlyError {
    const code = error.code as ProviderErrorCode;
    const mapped = PROVIDER_ERROR_MAP[code];

    if (mapped) {
      return { ...mapped };
    }

    return { ...PROVIDER_ERROR_MAP['UNKNOWN_ERROR'] };
  }

  mapErrorCode(code: string): UserFriendlyError {
    const providerCode = code as ProviderErrorCode;
    const mapped = PROVIDER_ERROR_MAP[providerCode];

    if (mapped) {
      return { ...mapped };
    }

    return { ...PROVIDER_ERROR_MAP['UNKNOWN_ERROR'] };
  }

  isRetryable(error: ProviderError): boolean {
    const code = error.code as ProviderErrorCode;
    const mapped = PROVIDER_ERROR_MAP[code];
    return mapped ? mapped.retryable : error.retryable;
  }

  getErrorTitle(error: ProviderError): string {
    return this.mapError(error).title;
  }

  getErrorMessage(error: ProviderError): string {
    return this.mapError(error).message;
  }
}
