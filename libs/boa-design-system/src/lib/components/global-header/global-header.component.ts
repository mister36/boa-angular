import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'boa-global-header',
  templateUrl: './global-header.component.html',
  styleUrls: ['./global-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalHeaderComponent implements OnInit, OnDestroy {
  @Input() userName = '';
  @Input() notificationCount = 0;
  @Input() showSearch = false;

  @Output() menuToggle = new EventEmitter<void>();
  @Output() signOut = new EventEmitter<void>();
  @Output() profileClick = new EventEmitter<void>();

  isMobile = false;
  private destroy$ = new Subject<void>();

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onSignOut(): void {
    this.signOut.emit();
  }

  onProfileClick(): void {
    this.profileClick.emit();
  }

  get userInitial(): string {
    return this.userName ? this.userName.charAt(0).toUpperCase() : '?';
  }
}
