import { FormControl, FormGroup } from '@angular/forms';
import {
  positiveAmountValidator,
  withinDailyLimitValidator,
  withinBalanceValidator,
  differentAccountsValidator
} from './transfer.validators';

describe('Transfer Validators', () => {
  describe('positiveAmountValidator', () => {
    const validator = positiveAmountValidator();

    it('should return null for positive amount', () => {
      const control = new FormControl('100');
      expect(validator(control)).toBeNull();
    });

    it('should return error for zero', () => {
      const control = new FormControl('0');
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result!['positiveAmount']).toBeTruthy();
    });

    it('should return error for negative amount', () => {
      const control = new FormControl('-50');
      expect(validator(control)).toBeTruthy();
    });

    it('should return error for non-numeric value', () => {
      const control = new FormControl('abc');
      expect(validator(control)).toBeTruthy();
    });

    it('should return error for empty string', () => {
      const control = new FormControl('');
      expect(validator(control)).toBeTruthy();
    });

    it('should accept decimal amounts', () => {
      const control = new FormControl('0.01');
      expect(validator(control)).toBeNull();
    });
  });

  describe('withinDailyLimitValidator', () => {
    const validator = withinDailyLimitValidator(10000);

    it('should return null for amount within limit', () => {
      const control = new FormControl('5000');
      expect(validator(control)).toBeNull();
    });

    it('should return null for amount at limit', () => {
      const control = new FormControl('10000');
      expect(validator(control)).toBeNull();
    });

    it('should return error for amount exceeding limit', () => {
      const control = new FormControl('10001');
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result!['dailyLimit']).toBeTruthy();
      expect(result!['dailyLimit'].limit).toBe(10000);
    });

    it('should use default limit of 10000 when not specified', () => {
      const defaultValidator = withinDailyLimitValidator();
      const control = new FormControl('10001');
      expect(defaultValidator(control)).toBeTruthy();
    });

    it('should accept custom limit', () => {
      const customValidator = withinDailyLimitValidator(500);
      const control = new FormControl('501');
      expect(customValidator(control)).toBeTruthy();
    });

    it('should return null for NaN values', () => {
      const control = new FormControl('abc');
      expect(validator(control)).toBeNull();
    });
  });

  describe('withinBalanceValidator', () => {
    const validator = withinBalanceValidator(5000);

    it('should return null when amount is within balance', () => {
      const control = new FormControl('3000');
      expect(validator(control)).toBeNull();
    });

    it('should return null when amount equals balance', () => {
      const control = new FormControl('5000');
      expect(validator(control)).toBeNull();
    });

    it('should return error when amount exceeds balance', () => {
      const control = new FormControl('5001');
      const result = validator(control);
      expect(result).toBeTruthy();
      expect(result!['insufficientFunds']).toBeTruthy();
      expect(result!['insufficientFunds'].availableBalance).toBe(5000);
    });
  });

  describe('differentAccountsValidator', () => {
    it('should return null when accounts are different', () => {
      const form = new FormGroup({
        source: new FormControl('acct-001'),
        destination: new FormControl('acct-002', [differentAccountsValidator('source')])
      });
      const destControl = form.get('destination')!;
      const result = differentAccountsValidator('source')(destControl);
      expect(result).toBeNull();
    });

    it('should return error when accounts are the same', () => {
      const form = new FormGroup({
        source: new FormControl('acct-001'),
        destination: new FormControl('acct-001', [differentAccountsValidator('source')])
      });
      const destControl = form.get('destination')!;
      const result = differentAccountsValidator('source')(destControl);
      expect(result).toBeTruthy();
      expect(result!['sameAccount']).toBeTruthy();
    });

    it('should return null when no parent form', () => {
      const control = new FormControl('acct-001');
      const result = differentAccountsValidator('source')(control);
      expect(result).toBeNull();
    });

    it('should return null when source is empty', () => {
      const form = new FormGroup({
        source: new FormControl(''),
        destination: new FormControl('acct-001', [differentAccountsValidator('source')])
      });
      const destControl = form.get('destination')!;
      const result = differentAccountsValidator('source')(destControl);
      expect(result).toBeNull();
    });
  });
});
