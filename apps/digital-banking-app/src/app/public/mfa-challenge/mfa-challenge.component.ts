import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'boa-mfa-challenge',
  templateUrl: './mfa-challenge.component.html',
  styleUrls: ['./mfa-challenge.component.scss']
})
export class MfaChallengeComponent implements OnDestroy {
  mfaForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  maskedDestination = '***-***-1234';
  failedAttempts = 0;
  maxAttempts = 3;
  isLockedOut = false;
  resendCooldown = 0;
  codeResent = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.mfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.mfaForm.invalid || this.isLockedOut) {
      this.mfaForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    setTimeout(() => {
      const code = this.mfaForm.get('code')?.value;

      if (code === '123456') {
        this.router.navigate(['/dashboard']);
      } else {
        this.failedAttempts++;

        if (this.failedAttempts >= this.maxAttempts) {
          this.isLockedOut = true;
          this.errorMessage =
            'Your account has been temporarily locked due to too many failed attempts. ' +
            'Please contact customer support or try again later.';
        } else {
          const remaining = this.maxAttempts - this.failedAttempts;
          this.errorMessage =
            `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`;
        }

        this.mfaForm.get('code')?.reset();
      }

      this.isLoading = false;
    }, 1000);
  }

  resendCode(): void {
    if (this.resendCooldown > 0) return;

    this.resendCooldown = 30;
    this.codeResent = true;
    this.errorMessage = '';

    interval(1000)
      .pipe(take(30), takeUntil(this.destroy$))
      .subscribe({
        next: (tick) => {
          this.resendCooldown = 29 - tick;
        },
        complete: () => {
          this.resendCooldown = 0;
        }
      });
  }
}
