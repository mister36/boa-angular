import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '@boa/auth';
import { AuthState, AuthStatus, MockSsoResponse, MockMfaResponse, AuthToken, UserProfile } from '@boa/auth';
import { MockSsoProvider } from '../../../../../../libs/auth/src/lib/services/mock-sso.provider';

describe('Login → MFA → Dashboard Integration', () => {
  let authService: AuthService;
  let router: jasmine.SpyObj<Router>;

  const mockToken: AuthToken = {
    accessToken: 'integration-test-token',
    refreshToken: 'integration-refresh-token',
    issuedAt: Date.now(),
    expiresAt: Date.now() + 900000
  };

  const mockUser: UserProfile = {
    id: 'usr_001',
    username: 'john.doe',
    displayName: 'John D.',
    email: 'j***@example.com',
    phone: '***-***-1234',
    roles: ['customer'],
    lastLogin: new Date()
  };

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));

    const mockSso = jasmine.createSpyObj('MockSsoProvider', ['authenticate', 'verifyMfa', 'resetMfaAttempts']);

    mockSso.authenticate.and.callFake((credentials: any) => {
      if (!credentials.username || !credentials.password || credentials.password.length < 8) {
        return of<MockSsoResponse>({ success: false, mfaRequired: false, errorCode: 'INVALID_CREDENTIALS' });
      }
      return of<MockSsoResponse>({
        success: true,
        mfaRequired: true,
        challenge: {
          challengeId: 'ch_integration',
          method: 'sms',
          maskedDestination: '***-***-1234',
          expiresAt: Date.now() + 300000,
          attemptsRemaining: 3
        }
      });
    });

    mockSso.verifyMfa.and.callFake((_id: string, code: string) => {
      if (code === '123456') {
        return of<MockMfaResponse>({ success: true, token: mockToken, user: mockUser });
      }
      return of<MockMfaResponse>({ success: false, locked: false, attemptsRemaining: 2 });
    });

    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: MockSsoProvider, useValue: mockSso },
        { provide: Router, useValue: router }
      ]
    });

    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    authService.ngOnDestroy();
    sessionStorage.clear();
  });

  it('should complete full login → MFA → authenticated flow', (done) => {
    authService.login({ username: 'testuser', password: 'password123', rememberDevice: false })
      .subscribe(stateAfterLogin => {
        expect(stateAfterLogin.status).toBe(AuthStatus.MfaPending);
        expect(stateAfterLogin.mfaChallenge).toBeTruthy();

        authService.completeMfa('123456').subscribe(stateAfterMfa => {
          expect(stateAfterMfa.status).toBe(AuthStatus.Authenticated);
          expect(stateAfterMfa.user?.displayName).toBe('John D.');
          expect(stateAfterMfa.token?.accessToken).toBe('integration-test-token');
          expect(sessionStorage.getItem('boa_auth_token')).toBe('integration-test-token');
          done();
        });
      });
  });

  it('should fail login with invalid credentials', (done) => {
    authService.login({ username: '', password: '', rememberDevice: false })
      .subscribe(state => {
        expect(state.status).toBe(AuthStatus.Unauthenticated);
        done();
      });
  });

  it('should fail MFA with wrong code and track attempts', (done) => {
    authService.login({ username: 'testuser', password: 'password123', rememberDevice: false })
      .subscribe(() => {
        authService.completeMfa('000000').subscribe(state => {
          expect(state.status).toBe(AuthStatus.MfaPending);
          expect(state.mfaChallenge?.attemptsRemaining).toBe(2);
          done();
        });
      });
  });

  it('should clear session and navigate to /login on logout', (done) => {
    authService.login({ username: 'testuser', password: 'password123', rememberDevice: false })
      .subscribe(() => {
        authService.completeMfa('123456').subscribe(() => {
          authService.logout();

          authService.authState$.subscribe(state => {
            expect(state.status).toBe(AuthStatus.Unauthenticated);
            expect(state.user).toBeNull();
            expect(router.navigate).toHaveBeenCalledWith(['/login']);
            done();
          });
        });
      });
  });
});
