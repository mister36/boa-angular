import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription, interval } from 'rxjs';
import { distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import {
  AuthState,
  AuthStatus,
  AuthToken,
  LoginCredentials,
  MfaChallenge,
  UserProfile
} from '../models/auth.models';
import { MockSsoProvider } from './mock-sso.provider';

const INITIAL_AUTH_STATE: AuthState = {
  status: AuthStatus.Unauthenticated,
  user: null,
  token: null,
  mfaChallenge: null,
  sessionExpiresAt: null
};

const SESSION_DURATION_MS = 15 * 60 * 1000;
const SESSION_STORAGE_KEY = 'boa_auth_token';
const CORRELATION_ID_KEY = 'boa_correlation_id';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private authStateSubject = new BehaviorSubject<AuthState>(INITIAL_AUTH_STATE);
  private destroy$ = new Subject<void>();
  private sessionTimerSub: Subscription | null = null;

  readonly authState$ = this.authStateSubject.asObservable();

  readonly currentUser$: Observable<UserProfile | null> = this.authState$.pipe(
    map(state => state.user),
    distinctUntilChanged()
  );

  readonly isAuthenticated$: Observable<boolean> = this.authState$.pipe(
    map(state => state.status === AuthStatus.Authenticated),
    distinctUntilChanged()
  );

  readonly isMfaRequired$: Observable<boolean> = this.authState$.pipe(
    map(state => state.status === AuthStatus.MfaPending),
    distinctUntilChanged()
  );

  readonly sessionExpiresAt$: Observable<number | null> = this.authState$.pipe(
    map(state => state.sessionExpiresAt),
    distinctUntilChanged()
  );

  constructor(
    private mockSso: MockSsoProvider,
    private router: Router
  ) {
    this.restoreSession();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopSessionTimer();
  }

  login(credentials: LoginCredentials): Observable<AuthState> {
    return this.mockSso.authenticate(credentials).pipe(
      tap(response => {
        if (response.success && response.mfaRequired && response.challenge) {
          this.updateState({
            status: AuthStatus.MfaPending,
            mfaChallenge: response.challenge
          });
        } else if (!response.success) {
          if (response.errorCode === 'ACCOUNT_LOCKED') {
            this.updateState({ status: AuthStatus.Locked });
          }
        }
      }),
      map(() => this.authStateSubject.value)
    );
  }

  completeMfa(code: string): Observable<AuthState> {
    const challenge = this.authStateSubject.value.mfaChallenge;
    const challengeId = challenge?.challengeId || '';

    return this.mockSso.verifyMfa(challengeId, code).pipe(
      tap(response => {
        if (response.success && response.token && response.user) {
          this.storeToken(response.token);
          const expiresAt = Date.now() + SESSION_DURATION_MS;
          this.updateState({
            status: AuthStatus.Authenticated,
            user: response.user,
            token: response.token,
            mfaChallenge: null,
            sessionExpiresAt: expiresAt
          });
          this.startSessionTimer();
        } else if (response.locked) {
          this.updateState({ status: AuthStatus.Locked, mfaChallenge: null });
        } else if (challenge && response.attemptsRemaining !== undefined) {
          this.updateState({
            mfaChallenge: {
              ...challenge,
              attemptsRemaining: response.attemptsRemaining
            }
          });
        }
      }),
      map(() => this.authStateSubject.value)
    );
  }

  logout(): void {
    this.clearSession();
    this.updateState(INITIAL_AUTH_STATE);
    this.stopSessionTimer();
    this.mockSso.resetMfaAttempts();
    this.router.navigate(['/login']);
  }

  refreshSession(): void {
    const state = this.authStateSubject.value;
    if (state.status === AuthStatus.Authenticated) {
      const newExpiresAt = Date.now() + SESSION_DURATION_MS;
      this.updateState({ sessionExpiresAt: newExpiresAt });
      this.restartSessionTimer();
    }
  }

  getToken(): string | null {
    const state = this.authStateSubject.value;
    return state.token?.accessToken || sessionStorage.getItem(SESSION_STORAGE_KEY);
  }

  getCorrelationId(): string {
    let id = sessionStorage.getItem(CORRELATION_ID_KEY);
    if (!id) {
      id = this.generateCorrelationId();
      sessionStorage.setItem(CORRELATION_ID_KEY, id);
    }
    return id;
  }

  private updateState(partial: Partial<AuthState>): void {
    const current = this.authStateSubject.value;
    this.authStateSubject.next({ ...current, ...partial });
  }

  private storeToken(token: AuthToken): void {
    sessionStorage.setItem(SESSION_STORAGE_KEY, token.accessToken);
  }

  private clearSession(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(CORRELATION_ID_KEY);
  }

  private restoreSession(): void {
    const storedToken = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedToken) {
      // In a real app we'd validate the token; here we just clear stale state
      // to avoid phantom authenticated states on page refresh without backend
      this.clearSession();
    }
  }

  private startSessionTimer(): void {
    this.stopSessionTimer();

    this.sessionTimerSub = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const state = this.authStateSubject.value;
        if (state.status !== AuthStatus.Authenticated || !state.sessionExpiresAt) {
          return;
        }

        if (Date.now() >= state.sessionExpiresAt) {
          this.expireSession();
        }
      });
  }

  private restartSessionTimer(): void {
    this.startSessionTimer();
  }

  private stopSessionTimer(): void {
    if (this.sessionTimerSub) {
      this.sessionTimerSub.unsubscribe();
      this.sessionTimerSub = null;
    }
  }

  private expireSession(): void {
    this.clearSession();
    this.stopSessionTimer();
    this.updateState({
      status: AuthStatus.Expired,
      token: null,
      sessionExpiresAt: null
    });
    this.router.navigate(['/session-expired']);
  }

  private generateCorrelationId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
