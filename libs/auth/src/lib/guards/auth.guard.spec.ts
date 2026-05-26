import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { AuthState, AuthStatus } from '../models/auth.models';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authStateSubject: BehaviorSubject<AuthState>;
  let router: jasmine.SpyObj<Router>;

  const makeState = (status: AuthStatus): AuthState => ({
    status,
    user: null,
    token: null,
    mfaChallenge: null,
    sessionExpiresAt: null
  });

  beforeEach(() => {
    authStateSubject = new BehaviorSubject<AuthState>(makeState(AuthStatus.Unauthenticated));
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.callFake((commands: any[]) => {
      return { toString: () => commands.join('/') } as UrlTree;
    });

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { authState$: authStateSubject.asObservable() } },
        { provide: Router, useValue: router }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow access when authenticated', async () => {
    authStateSubject.next(makeState(AuthStatus.Authenticated));
    const result = await firstValueFrom(guard.canActivate());
    expect(result).toBeTrue();
  });

  it('should redirect to /mfa when MFA is pending', async () => {
    authStateSubject.next(makeState(AuthStatus.MfaPending));
    await firstValueFrom(guard.canActivate());
    expect(router.createUrlTree).toHaveBeenCalledWith(['/mfa']);
  });

  it('should redirect to /login when unauthenticated', async () => {
    authStateSubject.next(makeState(AuthStatus.Unauthenticated));
    await firstValueFrom(guard.canActivate());
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to /login when session expired', async () => {
    authStateSubject.next(makeState(AuthStatus.Expired));
    await firstValueFrom(guard.canActivate());
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to /login when locked', async () => {
    authStateSubject.next(makeState(AuthStatus.Locked));
    await firstValueFrom(guard.canActivate());
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
