import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'boa-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent {
  @Input() label = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() type: 'text' | 'currency' | 'masked' | 'password' = 'text';
  @Input() control: FormControl = new FormControl();

  passwordVisible = false;

  get inputType(): string {
    if (this.type === 'password' || this.type === 'masked') {
      return this.passwordVisible ? 'text' : 'password';
    }
    return 'text';
  }

  get prefixSymbol(): string {
    return this.type === 'currency' ? '$' : '';
  }

  get showToggle(): boolean {
    return this.type === 'password' || this.type === 'masked';
  }

  toggleVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  getErrorMessage(): string {
    if (!this.control) {
      return '';
    }
    if (this.control.hasError('required')) {
      return 'This field is required';
    }
    if (this.control.hasError('minlength')) {
      const err = this.control.getError('minlength');
      return `Minimum ${err.requiredLength} characters`;
    }
    if (this.control.hasError('maxlength')) {
      const err = this.control.getError('maxlength');
      return `Maximum ${err.requiredLength} characters`;
    }
    if (this.control.hasError('pattern')) {
      return 'Invalid format';
    }
    if (this.control.hasError('min')) {
      const err = this.control.getError('min');
      return `Minimum value is ${err.min}`;
    }
    if (this.control.hasError('max')) {
      const err = this.control.getError('max');
      return `Maximum value is ${err.max}`;
    }
    if (this.control.hasError('email')) {
      return 'Invalid email address';
    }
    return 'Invalid value';
  }
}
