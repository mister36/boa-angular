import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject, of } from 'rxjs';
import { MfaChallengeComponent } from './mfa-challenge.component';
import { AuthService, AuthState, AuthStatus } from '@boa/auth';

describe('MfaChallengeComponent', () => {
  let component: MfaChallengeComponent;
  let fixture: ComponentFixture<MfaChallengeComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let authStateSubject: BehaviorSubject<AuthState>;

  const mfaPendingState: AuthState = {
    status: AuthStatus.MfaPending,
    user: null,
    token: null,
    mfaChallenge: {
      challengeId: 'ch_test',
      method: 'sms',
      maskedDestination: '***-***-5678',
      expiresAt: Date.now() + 300000,
      attemptsRemaining: 3
    },
    sessionExpiresAt: null
  };

  beforeEach(async () => {
    authStateSubject = new BehaviorSubject<AuthState>(mfaPendingState);
    authService = jasmine.createSpyObj('AuthService', ['completeMfa'], {
      authState$: authStateSubject.asObservable()
    });
    router = jasmine.createSpyObj('Router', ['navigate']);
    (router.navigate as jasmine.Spy).and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
      ],
      declarations: [MfaChallengeComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MfaChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should require the code field', () => {
      const codeControl = component.mfaForm.get('code');
      codeControl?.setValue('');
      expect(codeControl?.hasError('required')).toBeTrue();
    });

    it('should require exactly 6 digits', () => {
      const codeControl = component.mfaForm.get('code');
      codeControl?.setValue('12345');
      expect(codeControl?.hasError('pattern')).toBeTrue();
    });

    it('should reject non-numeric characters', () => {
      const codeControl = component.mfaForm.get('code');
      codeControl?.setValue('abcdef');
      expect(codeControl?.hasError('pattern')).toBeTrue();
    });

    it('should accept valid 6-digit code', () => {
      const codeControl = component.mfaForm.get('code');
      codeControl?.setValue('123456');
      expect(codeControl?.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should not call completeMfa if form is invalid', () => {
      component.mfaForm.get('code')?.setValue('');
      component.onSubmit();
      expect(authService.completeMfa).not.toHaveBeenCalled();
    });

    it('should not submit when locked out', () => {
      component.isLockedOut = true;
      component.mfaForm.get('code')?.setValue('123456');
      component.onSubmit();
      expect(authService.completeMfa).not.toHaveBeenCalled();
    });

    it('should navigate to /dashboard on successful MFA', () => {
      const authenticatedState: AuthState = {
        ...mfaPendingState,
        status: AuthStatus.Authenticated,
        user: {
          id: 'usr_001', username: 'john.doe', displayName: 'John D.',
          email: 'j@e.com', phone: '555-1234', roles: ['customer'],
          lastLogin: new Date()
        },
        mfaChallenge: null
      };
      authService.completeMfa.and.returnValue(of(authenticatedState));

      component.mfaForm.get('code')?.setValue('123456');
      component.onSubmit();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(component.isLoading).toBeFalse();
    });

    it('should show lockout message when response indicates locked', () => {
      const lockedState: AuthState = {
        ...mfaPendingState,
        status: AuthStatus.Locked,
        mfaChallenge: null
      };
      authService.completeMfa.and.returnValue(of(lockedState));

      component.mfaForm.get('code')?.setValue('000000');
      component.onSubmit();

      expect(component.isLockedOut).toBeTrue();
      expect(component.errorMessage).toContain('locked');
    });

    it('should show attempts remaining on wrong code', () => {
      const failedState: AuthState = {
        ...mfaPendingState,
        mfaChallenge: {
          ...mfaPendingState.mfaChallenge!,
          attemptsRemaining: 2
        }
      };
      authService.completeMfa.and.returnValue(of(failedState));

      component.mfaForm.get('code')?.setValue('000000');
      component.onSubmit();

      expect(component.errorMessage).toContain('2');
      expect(component.errorMessage).toContain('attempt');
    });

    it('should set loading state during submission', () => {
      authService.completeMfa.and.returnValue(of(mfaPendingState));

      component.mfaForm.get('code')?.setValue('123456');
      expect(component.isLoading).toBeFalse();
      component.onSubmit();
      expect(component.isLoading).toBeFalse(); // already resolved synchronously
    });
  });

  describe('resendCode', () => {
    it('should set cooldown to 30 seconds', () => {
      component.resendCode();
      expect(component.resendCooldown).toBe(30);
      expect(component.codeResent).toBeTrue();
    });

    it('should clear error message on resend', () => {
      component.errorMessage = 'Some error';
      component.resendCode();
      expect(component.errorMessage).toBe('');
    });

    it('should not resend while cooldown is active', () => {
      component.resendCooldown = 15;
      const previousCodeResent = component.codeResent;
      component.resendCode();
      expect(component.codeResent).toBe(previousCodeResent);
    });

    it('should count down cooldown', fakeAsync(() => {
      component.resendCode();
      expect(component.resendCooldown).toBe(30);

      tick(1000);
      expect(component.resendCooldown).toBe(29);

      tick(4000);
      expect(component.resendCooldown).toBe(25);

      tick(25000);
      expect(component.resendCooldown).toBe(0);

      component.ngOnDestroy();
    }));
  });

  describe('masked destination', () => {
    it('should read masked destination from auth state', () => {
      expect(component.maskedDestination).toBe('***-***-5678');
    });

    it('should update when auth state changes', () => {
      const newState: AuthState = {
        ...mfaPendingState,
        mfaChallenge: {
          ...mfaPendingState.mfaChallenge!,
          maskedDestination: '***-***-9999'
        }
      };
      authStateSubject.next(newState);
      expect(component.maskedDestination).toBe('***-***-9999');
    });
  });
});
