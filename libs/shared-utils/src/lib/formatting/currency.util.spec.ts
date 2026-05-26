import { formatCurrency, parseCurrency } from './currency.util';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('should format standard amount as $1,234.56', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should format zero as $0.00', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should format negative amount with -$ prefix', () => {
      const result = formatCurrency(-500);
      expect(result).toBe('-$500.00');
    });

    it('should return masked value $**** when masked option is true', () => {
      expect(formatCurrency(1234, { masked: true })).toBe('$****');
    });

    it('should return **** when masked without symbol', () => {
      expect(formatCurrency(1234, { masked: true, showSymbol: false })).toBe('****');
    });

    it('should format compact thousands as K', () => {
      expect(formatCurrency(1200, { compact: true })).toBe('$1.2K');
    });

    it('should format compact millions as M', () => {
      expect(formatCurrency(1500000, { compact: true })).toBe('$1.5M');
    });

    it('should format compact negative values', () => {
      expect(formatCurrency(-2500, { compact: true })).toBe('-$2.5K');
    });

    it('should format compact small values normally', () => {
      expect(formatCurrency(50, { compact: true })).toBe('$50.00');
    });

    it('should format without symbol when showSymbol is false', () => {
      const result = formatCurrency(1234.56, { showSymbol: false });
      expect(result).toContain('1,234.56');
      expect(result).not.toContain('$');
    });
  });

  describe('parseCurrency', () => {
    it('should parse $1,234.56 to 1234.56', () => {
      expect(parseCurrency('$1,234.56')).toBe(1234.56);
    });

    it('should parse plain number string', () => {
      expect(parseCurrency('100.50')).toBe(100.50);
    });

    it('should return null for empty string', () => {
      expect(parseCurrency('')).toBeNull();
    });

    it('should return null for non-numeric string', () => {
      expect(parseCurrency('abc')).toBeNull();
    });

    it('should parse negative value', () => {
      expect(parseCurrency('-$500.00')).toBe(-500);
    });

    it('should round to 2 decimal places', () => {
      expect(parseCurrency('10.999')).toBe(11);
    });
  });
});
