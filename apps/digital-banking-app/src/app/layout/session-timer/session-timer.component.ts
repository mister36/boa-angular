import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'boa-session-timer',
  templateUrl: './session-timer.component.html',
  styleUrls: ['./session-timer.component.scss']
})
export class SessionTimerComponent implements OnInit, OnDestroy {
  remainingMinutes = 15;
  remainingSeconds = 0;
  isWarning = false;

  private destroy$ = new Subject<void>();
  private totalSeconds = 15 * 60;

  ngOnInit(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.totalSeconds > 0) {
          this.totalSeconds--;
          this.remainingMinutes = Math.floor(this.totalSeconds / 60);
          this.remainingSeconds = this.totalSeconds % 60;
          this.isWarning = this.totalSeconds <= 120;
        }
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
