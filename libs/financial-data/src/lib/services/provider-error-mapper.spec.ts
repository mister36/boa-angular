import { ProviderErrorMapper } from './provider-error-mapper';
import { ProviderError } from '../models/transfer.models';
import { PROVIDER_ERROR_MAP } from '../models/provider-error.models';

describe('ProviderErrorMapper', () => {
  let mapper: ProviderErrorMapper;

  beforeEach(() => {
    mapper = new ProviderErrorMapper();
  });

  describe('mapError', () => {
    it('should map INSUFFICIENT_FUNDS to user-friendly error', () => {
      const error: ProviderError = {
        code: 'INSUFFICIENT_FUNDS',
        technicalMessage: 'Balance check failed',
        retryable: false
      };
      const result = mapper.mapError(error);
      expect(result.title).toBe('Insufficient Funds');
      expect(result.message).toContain('not have enough available funds');
      expect(result.retryable).toBeFalse();
    });

    it('should map PROVIDER_TIMEOUT to retryable error', () => {
      const error: ProviderError = {
        code: 'PROVIDER_TIMEOUT',
        technicalMessage: 'Connection timed out',
        retryable: true
      };
      const result = mapper.mapError(error);
      expect(result.title).toBe('Connection Timeout');
      expect(result.retryable).toBeTrue();
      expect(result.actionLabel).toBe('Try Again');
    });

    it('should map ACCOUNT_FROZEN to non-retryable error', () => {
      const error: ProviderError = {
        code: 'ACCOUNT_FROZEN',
        technicalMessage: 'Account is frozen',
        retryable: false
      };
      const result = mapper.mapError(error);
      expect(result.title).toBe('Account Restricted');
      expect(result.retryable).toBeFalse();
    });

    it('should map unknown error codes to UNKNOWN_ERROR', () => {
      const error: ProviderError = {
        code: 'COMPLETELY_UNKNOWN_CODE',
        technicalMessage: 'Something weird happened',
        retryable: false
      };
      const result = mapper.mapError(error);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.title).toBe('Something Went Wrong');
    });

    it('should return a copy, not a reference to the map entry', () => {
      const error: ProviderError = {
        code: 'NETWORK_ERROR',
        technicalMessage: 'Network failed',
        retryable: true
      };
      const result1 = mapper.mapError(error);
      const result2 = mapper.mapError(error);
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('mapErrorCode', () => {
    it('should map a known code string', () => {
      const result = mapper.mapErrorCode('SERVICE_UNAVAILABLE');
      expect(result.title).toBe('Service Unavailable');
      expect(result.retryable).toBeTrue();
    });

    it('should map unknown code string to UNKNOWN_ERROR', () => {
      const result = mapper.mapErrorCode('SOME_RANDOM_CODE');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('isRetryable', () => {
    it('should return true for PROVIDER_TIMEOUT', () => {
      const error: ProviderError = {
        code: 'PROVIDER_TIMEOUT',
        technicalMessage: 'Timeout',
        retryable: true
      };
      expect(mapper.isRetryable(error)).toBeTrue();
    });

    it('should return false for INSUFFICIENT_FUNDS', () => {
      const error: ProviderError = {
        code: 'INSUFFICIENT_FUNDS',
        technicalMessage: 'Not enough funds',
        retryable: false
      };
      expect(mapper.isRetryable(error)).toBeFalse();
    });

    it('should fall back to error.retryable for unknown codes', () => {
      const error: ProviderError = {
        code: 'MYSTERY_ERROR',
        technicalMessage: 'Unknown',
        retryable: true
      };
      expect(mapper.isRetryable(error)).toBeTrue();
    });
  });

  describe('getErrorTitle', () => {
    it('should return the mapped title', () => {
      const error: ProviderError = {
        code: 'DAILY_LIMIT_EXCEEDED',
        technicalMessage: 'Limit exceeded',
        retryable: false
      };
      expect(mapper.getErrorTitle(error)).toBe('Daily Limit Reached');
    });
  });

  describe('getErrorMessage', () => {
    it('should return the mapped message', () => {
      const error: ProviderError = {
        code: 'INVALID_ACCOUNT',
        technicalMessage: 'Account not found',
        retryable: false
      };
      expect(mapper.getErrorMessage(error)).toContain('could not be found');
    });
  });

  it('should have all 13 error codes mapped', () => {
    const codes = Object.keys(PROVIDER_ERROR_MAP);
    expect(codes.length).toBe(13);
  });
});
