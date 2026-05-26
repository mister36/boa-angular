import { TestBed } from '@angular/core/testing';
import { AuditLogService } from './audit-log.service';
import { AuthService } from '@boa/auth';
import { EnvironmentConfigService } from '@boa/shared-utils';

describe('AuditLogService Integration', () => {
  let service: AuditLogService;
  let consoleSpy: jasmine.Spy;

  beforeEach(() => {
    const mockAuthService = {
      getToken: jasmine.createSpy('getToken').and.returnValue('mock-token'),
      getCorrelationId: jasmine.createSpy('getCorrelationId').and.returnValue('corr-12345'),
      currentUser$: { subscribe: () => {} }
    };

    const mockEnvConfig = {
      get: jasmine.createSpy('get').and.callFake((key: string) => {
        if (key === 'auditLoggingEnabled') return true;
        return null;
      })
    };

    TestBed.configureTestingModule({
      providers: [
        AuditLogService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: EnvironmentConfigService, useValue: mockEnvConfig }
      ]
    });

    service = TestBed.inject(AuditLogService);
    consoleSpy = spyOn(console, 'log');
  });

  it('should emit structured audit event for login attempt', () => {
    service.logLoginAttempt('john.doe', true);

    expect(consoleSpy).toHaveBeenCalled();
    const logArgs = consoleSpy.calls.mostRecent().args;
    expect(logArgs[0]).toContain('login_attempt');

    const event = JSON.parse(logArgs[1]);
    expect(event.correlationId).toBe('corr-12345');
    expect(event.timestamp).toBeTruthy();
    expect(event.severity).toBe('info');
  });

  it('should emit warning severity for failed login', () => {
    service.logLoginAttempt('john.doe', false);

    const logArgs = consoleSpy.calls.mostRecent().args;
    const event = JSON.parse(logArgs[1]);
    expect(event.severity).toBe('warning');
  });

  it('should emit critical severity for transfer confirmation', () => {
    service.logTransferConfirmation('usr_001', {
      sourceAccountId: 'acct-001',
      destinationAccountId: 'acct-002',
      amount: 500,
      currency: 'USD'
    }, 'TRF-789');

    const logArgs = consoleSpy.calls.mostRecent().args;
    expect(logArgs[0]).toContain('transfer_confirmation');

    const event = JSON.parse(logArgs[1]);
    expect(event.severity).toBe('critical');
    expect(event.correlationId).toBe('corr-12345');
    expect(event.userId).toBe('usr_001');
  });

  it('should redact PII in metadata', () => {
    service.logLoginAttempt('john.doe', true, {
      email: 'john@example.com',
      phone: '555-123-4567'
    });

    const logArgs = consoleSpy.calls.mostRecent().args;
    const event = JSON.parse(logArgs[1]);
    expect(event.metadata.email).not.toBe('john@example.com');
    expect(event.metadata.phone).not.toBe('555-123-4567');
    expect(event.metadata.phone).toContain('4567');
  });

  it('should include correlationId in all events', () => {
    service.logMfaResult('usr_001', true);
    service.logLogout('usr_001');
    service.logSessionExpired('usr_001');

    const calls = consoleSpy.calls.allArgs();
    for (const call of calls) {
      const event = JSON.parse(call[1]);
      expect(event.correlationId).toBe('corr-12345');
    }
  });

  it('should include userId in events', () => {
    service.logProfileSecurityChange('usr_001', 'mfa_enabled');

    const logArgs = consoleSpy.calls.mostRecent().args;
    const event = JSON.parse(logArgs[1]);
    expect(event.userId).toBe('usr_001');
    expect(event.severity).toBe('critical');
  });

  it('should not emit when auditLoggingEnabled is false', () => {
    const disabledEnvConfig = {
      get: jasmine.createSpy('get').and.returnValue(false)
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuditLogService,
        { provide: AuthService, useValue: { getToken: () => 'tk', getCorrelationId: () => 'c' } },
        { provide: EnvironmentConfigService, useValue: disabledEnvConfig }
      ]
    });

    const disabledService = TestBed.inject(AuditLogService);
    consoleSpy.calls.reset();

    disabledService.logLoginAttempt('test', true);
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
