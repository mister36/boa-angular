import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, AuthStatus, LoginCredentials } from '@boa/auth';

@Component({
  selector: 'boa-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  loginError = '';
  hidePassword = true;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberDevice: [false]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    const credentials: LoginCredentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
      rememberDevice: this.loginForm.value.rememberDevice
    };

    this.authService.login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (state) => {
          this.isLoading = false;
          if (state.status === AuthStatus.MfaPending) {
            this.router.navigate(['/mfa']);
          } else if (state.status === AuthStatus.Locked) {
            this.loginError = 'Your account has been locked due to suspicious activity. Please contact support.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.loginError = err?.error || 'Invalid username or password. Please try again.';
        }
      });
  }
}
