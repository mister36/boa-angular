import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subject, take, takeUntil } from 'rxjs';
import { AuthService, AuthStatus } from '@boa/auth';

@Component({
  selector: 'boa-mfa-challenge',
  templateUrl: './mfa-challenge.component.html',
  styleUrls: ['./mfa-challenge.component.scss']
})
export class MfaChallengeComponent implements OnInit, OnDestroy {
  mfaForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  maskedDestination = '***-***-1234';
  isLockedOut = false;
  resendCooldown = 0;
  codeResent = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.mfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.mfaChallenge) {
          this.maskedDestination = state.mfaChallenge.maskedDestination;
        }
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

    const code = this.mfaForm.get('code')?.value;

    this.authService.completeMfa(code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (state) => {
          this.isLoading = false;

          if (state.status === AuthStatus.Authenticated) {
            this.router.navigate(['/dashboard']);
          } else if (state.status === AuthStatus.Locked) {
            this.isLockedOut = true;
            this.errorMessage =
              'Your account has been temporarily locked due to too many failed attempts. ' +
              'Please contact customer support or try again later.';
          } else if (state.mfaChallenge) {
            const remaining = state.mfaChallenge.attemptsRemaining;
            this.errorMessage =
              `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`;
            this.mfaForm.get('code')?.reset();
          }
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
      });
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
