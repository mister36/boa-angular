import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function positiveAmountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = parseFloat(control.value);
    if (isNaN(value) || value <= 0) {
      return { positiveAmount: { message: 'Amount must be greater than zero' } };
    }
    return null;
  };
}

export function withinDailyLimitValidator(limit: number = 10000): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = parseFloat(control.value);
    if (!isNaN(value) && value > limit) {
      return { dailyLimit: { message: `Amount exceeds the $${limit.toLocaleString()} daily limit`, limit } };
    }
    return null;
  };
}

export function withinBalanceValidator(availableBalance: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = parseFloat(control.value);
    if (!isNaN(value) && value > availableBalance) {
      return { insufficientFunds: { message: 'Insufficient funds in source account', availableBalance } };
    }
    return null;
  };
}

export function differentAccountsValidator(sourceControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;

    const sourceValue = parent.get(sourceControlName)?.value;
    if (sourceValue && control.value && sourceValue === control.value) {
      return { sameAccount: { message: 'Source and destination accounts must be different' } };
    }
    return null;
  };
}
