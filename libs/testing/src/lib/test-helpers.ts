import { BehaviorSubject, of } from 'rxjs';
import { AuthState, AuthStatus, UserProfile } from '@boa/auth';

const MOCK_USER: UserProfile = {
  id: 'usr_001',
  username: 'john.doe',
  displayName: 'John D.',
  email: 'j***@example.com',
  phone: '***-***-1234',
  roles: ['customer', 'digital-banking'],
  lastLogin: new Date('2024-01-01')
};

const INITIAL_AUTH_STATE: AuthState = {
  status: AuthStatus.Unauthenticated,
  user: null,
  token: null,
  mfaChallenge: null,
  sessionExpiresAt: null
};

export function createMockAuthService(initialState?: Partial<AuthState>) {
  const state = { ...INITIAL_AUTH_STATE, ...initialState };
  const authStateSubject = new BehaviorSubject<AuthState>(state);

  return {
    authState$: authStateSubject.asObservable(),
    currentUser$: of(state.user),
    isAuthenticated$: of(state.status === AuthStatus.Authenticated),
    isMfaRequired$: of(state.status === AuthStatus.MfaPending),
    sessionExpiresAt$: of(state.sessionExpiresAt),
    login: jasmine.createSpy('login').and.returnValue(of(state)),
    completeMfa: jasmine.createSpy('completeMfa').and.returnValue(of(state)),
    logout: jasmine.createSpy('logout'),
    refreshSession: jasmine.createSpy('refreshSession'),
    getToken: jasmine.createSpy('getToken').and.returnValue('mock-token'),
    getCorrelationId: jasmine.createSpy('getCorrelationId').and.returnValue('test-correlation-id'),
    _stateSubject: authStateSubject,
    _mockUser: MOCK_USER
  };
}

export function createMockRouter() {
  return {
    navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    createUrlTree: jasmine.createSpy('createUrlTree').and.callFake(
      (commands: any[]) => ({ toString: () => commands.join('/') })
    ),
    events: of()
  };
}

export function createMockEnvironmentConfigService(overrides?: Record<string, unknown>) {
  const config: Record<string, unknown> = {
    production: false,
    apiBaseUrl: '/api/v1',
    authBaseUrl: '/auth',
    analyticsEnabled: true,
    auditLoggingEnabled: true,
    sessionTimeoutMinutes: 15,
    maxMfaAttempts: 3,
    transferDailyLimit: 10000,
    ...overrides
  };

  return {
    get: jasmine.createSpy('get').and.callFake((key: string) => config[key]),
    getAll: jasmine.createSpy('getAll').and.returnValue({ ...config }),
    isProduction: jasmine.createSpy('isProduction').and.returnValue(false),
    getApiUrl: jasmine.createSpy('getApiUrl').and.callFake((path: string) => `/api/v1${path}`),
    getAuthUrl: jasmine.createSpy('getAuthUrl').and.callFake((path: string) => `/auth${path}`),
    initialize: jasmine.createSpy('initialize')
  };
}
