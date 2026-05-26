import { redactEmail, redactPhone, redactSsn, redactPii } from './pii-redaction.util';

describe('PII Redaction Utilities', () => {
  describe('redactEmail', () => {
    it('should mask email local part keeping first and last char', () => {
      const result = redactEmail('john.doe@example.com');
      expect(result).toMatch(/^j\*+e@example\.com$/);
    });

    it('should handle short local part (2 chars)', () => {
      const result = redactEmail('ab@example.com');
      expect(result).toBe('*@example.com');
    });

    it('should return empty string for empty input', () => {
      expect(redactEmail('')).toBe('');
    });

    it('should return as-is when no @ symbol', () => {
      expect(redactEmail('noemail')).toBe('noemail');
    });

    it('should handle single char before @', () => {
      expect(redactEmail('a@b.com')).toBe('a@b.com');
    });
  });

  describe('redactPhone', () => {
    it('should mask phone keeping last 4 digits', () => {
      expect(redactPhone('555-123-4567')).toBe('(***) ***-4567');
    });

    it('should handle phone with country code', () => {
      expect(redactPhone('+1-555-123-4567')).toBe('(***) ***-4567');
    });

    it('should return **** for very short phone', () => {
      expect(redactPhone('12')).toBe('****');
    });

    it('should return empty string for empty input', () => {
      expect(redactPhone('')).toBe('');
    });
  });

  describe('redactSsn', () => {
    it('should mask SSN keeping last 4 digits', () => {
      expect(redactSsn('123-45-6789')).toBe('***-**-6789');
    });

    it('should handle SSN without dashes', () => {
      expect(redactSsn('123456789')).toBe('***-**-6789');
    });

    it('should return default mask for short input', () => {
      expect(redactSsn('12')).toBe('***-**-****');
    });

    it('should return empty string for empty input', () => {
      expect(redactSsn('')).toBe('');
    });
  });

  describe('redactPii', () => {
    it('should redact email fields in objects', () => {
      const obj = { email: 'test@example.com', name: 'John' };
      const result = redactPii(obj);
      expect(result.email).not.toBe('test@example.com');
      expect(result.email).toContain('@example.com');
      expect(result.name).toBe('John');
    });

    it('should redact phone fields in objects', () => {
      const obj = { phone: '555-123-4567' };
      const result = redactPii(obj);
      expect(result.phone).toBe('(***) ***-4567');
    });

    it('should redact ssn fields in objects', () => {
      const obj = { ssn: '123-45-6789' };
      const result = redactPii(obj);
      expect(result.ssn).toBe('***-**-6789');
    });

    it('should redact password fields completely', () => {
      const obj = { password: 'secret123' };
      const result = redactPii(obj);
      expect(result.password).toBe('[REDACTED]');
    });

    it('should redact token fields completely', () => {
      const obj = { token: 'abc.def.ghi' };
      const result = redactPii(obj);
      expect(result.token).toBe('[REDACTED]');
    });

    it('should redact accountNumber fields', () => {
      const obj = { accountNumber: '1234567890' };
      const result = redactPii(obj);
      expect(result.accountNumber).toBe('****7890');
    });

    it('should handle nested objects recursively', () => {
      const obj = {
        user: {
          email: 'deep@test.com',
          profile: {
            phone: '555-000-1234'
          }
        }
      };
      const result = redactPii(obj);
      expect(result.user.email).toContain('@test.com');
      expect(result.user.email).not.toBe('deep@test.com');
      expect(result.user.profile.phone).toBe('(***) ***-1234');
    });

    it('should handle arrays', () => {
      const arr = [{ email: 'a@b.com' }, { email: 'c@d.com' }];
      const result = redactPii(arr);
      expect(Array.isArray(result)).toBeTrue();
      expect(result[0].email).toContain('@b.com');
    });

    it('should return null/undefined as-is', () => {
      expect(redactPii(null)).toBeNull();
      expect(redactPii(undefined)).toBeUndefined();
    });

    it('should return primitives as-is', () => {
      expect(redactPii(42)).toBe(42);
      expect(redactPii(true)).toBeTrue();
    });

    it('should redact inline SSN in string values', () => {
      const result = redactPii('my ssn is 123-45-6789 thanks');
      expect(result).toContain('***-**-****');
      expect(result).not.toContain('123-45-6789');
    });
  });
});
