import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { MockSsoProvider } from './mock-sso.provider';
import { AuthStatus, MockSsoResponse, MockMfaResponse, AuthToken, UserProfile } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let mockSso: jasmine.SpyObj<MockSsoProvider>;
  let router: jasmine.SpyObj<Router>;

  const mockToken: AuthToken = {
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
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
    mockSso = jasmine.createSpyObj('MockSsoProvider', ['authenticate', 'verifyMfa', 'resetMfaAttempts']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: MockSsoProvider, useValue: mockSso },
        { provide: Router, useValue: router }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    sessionStorage.clear();
  });

  describe('initial state', () => {
    it('should start with unauthenticated status', (done) => {
      service.authState$.subscribe(state => {
        expect(state.status).toBe(AuthStatus.Unauthenticated);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        done();
      });
    });

    it('should emit false for isAuthenticated$', (done) => {
      service.isAuthenticated$.subscribe(val => {
        expect(val).toBeFalse();
        done();
      });
    });

    it('should emit null for currentUser$', (done) => {
      service.currentUser$.subscribe(val => {
        expect(val).toBeNull();
        done();
      });
    });
  });

  describe('login', () => {
    it('should set MfaPending status on successful login with MFA required', (done) => {
      const response: MockSsoResponse = {
        success: true,
        mfaRequired: true,
        challenge: {
          challengeId: 'ch_test',
          method: 'sms',
          maskedDestination: '***-***-1234',
          expiresAt: Date.now() + 300000,
          attemptsRemaining: 3
        }
      };
      mockSso.authenticate.and.returnValue(of(response));

      service.login({ username: 'test', password: 'password123', rememberDevice: false })
        .subscribe(state => {
          expect(state.status).toBe(AuthStatus.MfaPending);
          expect(state.mfaChallenge).toBeTruthy();
          expect(state.mfaChallenge!.challengeId).toBe('ch_test');
          done();
        });
    });

    it('should set Locked status on ACCOUNT_LOCKED error', (done) => {
      const response: MockSsoResponse = {
        success: false,
        mfaRequired: false,
        errorCode: 'ACCOUNT_LOCKED',
        error: 'Account locked'
      };
      mockSso.authenticate.and.returnValue(of(response));

      service.login({ username: 'locked', password: 'password123', rememberDevice: false })
        .subscribe(state => {
          expect(state.status).toBe(AuthStatus.Locked);
          done();
        });
    });

    it('should remain unauthenticated on invalid credentials', (done) => {
      const response: MockSsoResponse = {
        success: false,
        mfaRequired: false,
        errorCode: 'INVALID_CREDENTIALS'
      };
      mockSso.authenticate.and.returnValue(of(response));

      service.login({ username: 'test', password: 'short', rememberDevice: false })
        .subscribe(state => {
          expect(state.status).toBe(AuthStatus.Unauthenticated);
          done();
        });
    });
  });

  describe('completeMfa', () => {
    beforeEach(() => {
      const loginResponse: MockSsoResponse = {
        success: true,
        mfaRequired: true,
        challenge: {
          challengeId: 'ch_test',
          method: 'sms',
          maskedDestination: '***-***-1234',
          expiresAt: Date.now() + 300000,
          attemptsRemaining: 3
        }
      };
      mockSso.authenticate.and.returnValue(of(loginResponse));
      service.login({ username: 'test', password: 'password123', rememberDevice: false }).subscribe();
    });

    it('should set Authenticated status on valid MFA code', (done) => {
      const mfaResponse: MockMfaResponse = {
        success: true,
        token: mockToken,
        user: mockUser
      };
      mockSso.verifyMfa.and.returnValue(of(mfaResponse));

      service.completeMfa('123456').subscribe(state => {
        expect(state.status).toBe(AuthStatus.Authenticated);
        expect(state.user).toEqual(mockUser);
        expect(state.token).toEqual(mockToken);
        expect(state.sessionExpiresAt).toBeTruthy();
        done();
      });
    });

    it('should store token in sessionStorage after MFA success', (done) => {
      const mfaResponse: MockMfaResponse = {
        success: true,
        token: mockToken,
        user: mockUser
      };
      mockSso.verifyMfa.and.returnValue(of(mfaResponse));

      service.completeMfa('123456').subscribe(() => {
        expect(sessionStorage.getItem('boa_auth_token')).toBe('test-access-token');
        done();
      });
    });

    it('should set Locked status when MFA response indicates locked', (done) => {
      const mfaResponse: MockMfaResponse = {
        success: false,
        locked: true,
        attemptsRemaining: 0,
        error: 'Locked'
      };
      mockSso.verifyMfa.and.returnValue(of(mfaResponse));

      service.completeMfa('000000').subscribe(state => {
        expect(state.status).toBe(AuthStatus.Locked);
        done();
      });
    });

    it('should update attempts remaining on wrong MFA code', (done) => {
      const mfaResponse: MockMfaResponse = {
        success: false,
        locked: false,
        attemptsRemaining: 2,
        error: 'Invalid code'
      };
      mockSso.verifyMfa.and.returnValue(of(mfaResponse));

      service.completeMfa('000000').subscribe(state => {
        expect(state.mfaChallenge!.attemptsRemaining).toBe(2);
        done();
      });
    });
  });

  describe('logout', () => {
    it('should reset state to unauthenticated', () => {
      service.logout();
      service.authState$.subscribe(state => {
        expect(state.status).toBe(AuthStatus.Unauthenticated);
        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
      });
    });

    it('should clear sessionStorage', () => {
      sessionStorage.setItem('boa_auth_token', 'some-token');
      sessionStorage.setItem('boa_correlation_id', 'some-id');
      service.logout();
      expect(sessionStorage.getItem('boa_auth_token')).toBeNull();
      expect(sessionStorage.getItem('boa_correlation_id')).toBeNull();
    });

    it('should navigate to /login', () => {
      service.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should reset MFA attempts on the SSO provider', () => {
      service.logout();
      expect(mockSso.resetMfaAttempts).toHaveBeenCalled();
    });
  });

  describe('getToken', () => {
    it('should return null when not authenticated', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return token from sessionStorage fallback', () => {
      sessionStorage.setItem('boa_auth_token', 'stored-token');
      expect(service.getToken()).toBe('stored-token');
    });
  });

  describe('getCorrelationId', () => {
    it('should generate a correlation ID if none exists', () => {
      const id = service.getCorrelationId();
      expect(id).toBeTruthy();
      expect(id.length).toBeGreaterThan(10);
    });

    it('should return the same ID on subsequent calls', () => {
      const id1 = service.getCorrelationId();
      const id2 = service.getCorrelationId();
      expect(id1).toBe(id2);
    });

    it('should store correlation ID in sessionStorage', () => {
      const id = service.getCorrelationId();
      expect(sessionStorage.getItem('boa_correlation_id')).toBe(id);
    });
  });

  describe('refreshSession', () => {
    it('should update sessionExpiresAt when authenticated', (done) => {
      const mfaResponse: MockMfaResponse = {
        success: true,
        token: mockToken,
        user: mockUser
      };
      const loginResponse: MockSsoResponse = {
        success: true,
        mfaRequired: true,
        challenge: {
          challengeId: 'ch_test', method: 'sms',
          maskedDestination: '***-***-1234',
          expiresAt: Date.now() + 300000,
          attemptsRemaining: 3
        }
      };
      mockSso.authenticate.and.returnValue(of(loginResponse));
      mockSso.verifyMfa.and.returnValue(of(mfaResponse));

      service.login({ username: 'test', password: 'password123', rememberDevice: false }).subscribe();
      service.completeMfa('123456').subscribe(() => {
        const before = Date.now();
        service.refreshSession();
        service.sessionExpiresAt$.subscribe(expiresAt => {
          expect(expiresAt).toBeGreaterThanOrEqual(before);
          done();
        });
      });
    });

    it('should not update session if not authenticated', () => {
      service.refreshSession();
      service.sessionExpiresAt$.subscribe(expiresAt => {
        expect(expiresAt).toBeNull();
      });
    });
  });
});
