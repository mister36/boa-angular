import { Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {
  AuthToken,
  LoginCredentials,
  MfaChallenge,
  MockMfaResponse,
  MockSsoResponse,
  MockTokenResponse,
  UserProfile
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class MockSsoProvider {
  private readonly VALID_MFA_CODE = '123456';
  private readonly SESSION_DURATION_MS = 15 * 60 * 1000;

  private mfaAttempts = 0;
  private readonly MAX_MFA_ATTEMPTS = 3;

  authenticate(credentials: LoginCredentials): Observable<MockSsoResponse> {
    const delay = this.randomDelay(800, 1500);

    return timer(delay).pipe(
      switchMap(() => {
        if (credentials.username.toLowerCase() === 'locked') {
          return of<MockSsoResponse>({
            success: false,
            mfaRequired: false,
            error: 'Your account has been locked due to suspicious activity. Please contact support.',
            errorCode: 'ACCOUNT_LOCKED'
          });
        }

        if (credentials.username.toLowerCase() === 'error') {
          return throwError(() => ({
            success: false,
            mfaRequired: false,
            error: 'An unexpected error occurred. Please try again later.',
            errorCode: 'SYSTEM_ERROR'
          }));
        }

        if (!credentials.username || !credentials.password || credentials.password.length < 8) {
          return of<MockSsoResponse>({
            success: false,
            mfaRequired: false,
            error: 'Invalid username or password. Please try again.',
            errorCode: 'INVALID_CREDENTIALS'
          });
        }

        this.mfaAttempts = 0;

        const challenge: MfaChallenge = {
          challengeId: this.generateId(),
          method: 'sms',
          maskedDestination: '***-***-1234',
          expiresAt: Date.now() + 5 * 60 * 1000,
          attemptsRemaining: this.MAX_MFA_ATTEMPTS
        };

        return of<MockSsoResponse>({
          success: true,
          mfaRequired: true,
          challenge
        });
      })
    );
  }

  verifyMfa(challengeId: string, code: string): Observable<MockMfaResponse> {
    const delay = this.randomDelay(600, 1200);

    return timer(delay).pipe(
      switchMap(() => {
        if (this.mfaAttempts >= this.MAX_MFA_ATTEMPTS) {
          return of<MockMfaResponse>({
            success: false,
            locked: true,
            attemptsRemaining: 0,
            error: 'Your account has been temporarily locked due to too many failed attempts. ' +
              'Please contact customer support or try again later.'
          });
        }

        if (code !== this.VALID_MFA_CODE) {
          this.mfaAttempts++;
          const remaining = this.MAX_MFA_ATTEMPTS - this.mfaAttempts;

          if (remaining === 0) {
            return of<MockMfaResponse>({
              success: false,
              locked: true,
              attemptsRemaining: 0,
              error: 'Your account has been temporarily locked due to too many failed attempts. ' +
                'Please contact customer support or try again later.'
            });
          }

          return of<MockMfaResponse>({
            success: false,
            locked: false,
            attemptsRemaining: remaining,
            error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          });
        }

        const now = Date.now();
        const token: AuthToken = {
          accessToken: this.generateToken(),
          refreshToken: this.generateToken(),
          issuedAt: now,
          expiresAt: now + this.SESSION_DURATION_MS
        };

        const user: UserProfile = {
          id: 'usr_001',
          username: 'john.doe',
          displayName: 'John D.',
          email: 'j***@example.com',
          phone: '***-***-1234',
          roles: ['customer', 'digital-banking'],
          lastLogin: new Date(now - 86400000)
        };

        this.mfaAttempts = 0;

        return of<MockMfaResponse>({
          success: true,
          token,
          user
        });
      })
    );
  }

  refreshToken(token: string): Observable<MockTokenResponse> {
    const delay = this.randomDelay(300, 600);

    return timer(delay).pipe(
      switchMap(() => {
        if (!token) {
          return of<MockTokenResponse>({
            success: false,
            error: 'Invalid refresh token'
          });
        }

        const now = Date.now();
        const newToken: AuthToken = {
          accessToken: this.generateToken(),
          refreshToken: this.generateToken(),
          issuedAt: now,
          expiresAt: now + this.SESSION_DURATION_MS
        };

        return of<MockTokenResponse>({
          success: true,
          token: newToken
        });
      })
    );
  }

  resetMfaAttempts(): void {
    this.mfaAttempts = 0;
  }

  private generateId(): string {
    return 'ch_' + Math.random().toString(36).substring(2, 15);
  }

  private generateToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'usr_001',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900
    }));
    const signature = Math.random().toString(36).substring(2, 30);
    return `${header}.${payload}.${signature}`;
  }

  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
