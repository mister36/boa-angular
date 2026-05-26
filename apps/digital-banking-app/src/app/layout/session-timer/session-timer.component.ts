import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';
import { AuthService, AuthStatus } from '@boa/auth';

@Component({
  selector: 'boa-session-timer',
  templateUrl: './session-timer.component.html',
  styleUrls: ['./session-timer.component.scss']
})
export class SessionTimerComponent implements OnInit, OnDestroy {
  remainingMinutes = 15;
  remainingSeconds = 0;
  isWarning = false;
  isVisible = false;

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isVisible = state.status === AuthStatus.Authenticated;
      });

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isVisible) return;

        this.authService.sessionExpiresAt$
          .pipe(takeUntil(this.destroy$))
          .subscribe(expiresAt => {
            if (!expiresAt) return;

            const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            this.remainingMinutes = Math.floor(remaining / 60);
            this.remainingSeconds = remaining % 60;
            this.isWarning = remaining <= 120 && remaining > 0;
          }).unsubscribe();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get formattedTime(): string {
    const mins = String(this.remainingMinutes).padStart(2, '0');
    const secs = String(this.remainingSeconds).padStart(2, '0');
    return `${mins}:${secs}`;
  }
}
