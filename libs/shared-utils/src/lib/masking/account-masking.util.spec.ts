import {
  maskAccountNumber,
  maskRoutingNumber,
  maskCreditCardNumber,
  getLastFourDigits
} from './account-masking.util';

describe('Account Masking Utilities', () => {
  describe('maskAccountNumber', () => {
    it('should mask account number keeping last 4 digits', () => {
      expect(maskAccountNumber('1234567890')).toBe('****7890');
    });

    it('should return empty string for empty input', () => {
      expect(maskAccountNumber('')).toBe('');
    });

    it('should return short numbers as-is (4 or fewer digits)', () => {
      expect(maskAccountNumber('1234')).toBe('1234');
      expect(maskAccountNumber('123')).toBe('123');
    });

    it('should handle 5-digit account number', () => {
      expect(maskAccountNumber('12345')).toBe('****2345');
    });
  });

  describe('maskRoutingNumber', () => {
    it('should mask routing number keeping last 4 digits', () => {
      expect(maskRoutingNumber('021000021')).toBe('****0021');
    });

    it('should return empty string for empty input', () => {
      expect(maskRoutingNumber('')).toBe('');
    });

    it('should return short numbers as-is', () => {
      expect(maskRoutingNumber('1234')).toBe('1234');
    });
  });

  describe('maskCreditCardNumber', () => {
    it('should mask credit card showing only last 4 digits', () => {
      const result = maskCreditCardNumber('4111111111111111');
      expect(result).toContain('1111');
      expect(result).toContain('****');
    });

    it('should handle card numbers with spaces', () => {
      const result = maskCreditCardNumber('4111 1111 1111 1111');
      expect(result).toContain('1111');
      expect(result).toContain('****');
    });

    it('should return empty string for empty input', () => {
      expect(maskCreditCardNumber('')).toBe('');
    });

    it('should return short numbers as-is', () => {
      expect(maskCreditCardNumber('1234')).toBe('1234');
    });
  });

  describe('getLastFourDigits', () => {
    it('should return last 4 digits', () => {
      expect(getLastFourDigits('1234567890')).toBe('7890');
    });

    it('should return empty string for empty input', () => {
      expect(getLastFourDigits('')).toBe('');
    });

    it('should return full string if less than 4 chars', () => {
      expect(getLastFourDigits('123')).toBe('123');
    });

    it('should return null input as empty string', () => {
      expect(getLastFourDigits(null as any)).toBe('');
    });
  });
});
