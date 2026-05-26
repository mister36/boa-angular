import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '@boa/auth';
import { AuditLogService } from '@boa/audit-logging';
import { AnalyticsService } from '@boa/analytics';
import { redactEmail, redactPhone } from '@boa/shared-utils';

interface LoginActivity {
  date: string;
  ipAddress: string;
  device: string;
  location: string;
  status: 'success' | 'failed';
}

interface TrustedDevice {
  id: string;
  name: string;
  lastUsed: string;
  browser: string;
}

interface MfaMethod {
  id: string;
  type: 'sms' | 'email' | 'authenticator';
  value: string;
  isPrimary: boolean;
}

@Component({
  selector: 'boa-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  userEmail = 'john.smith@email.com';
  userPhone = '(555) 123-4567';
  userName = 'John A. Smith';
  memberSince = '2019-03-15';

  maskedEmail = '';
  maskedPhone = '';

  paperlessEnabled = true;

  loginActivityColumns = ['date', 'ipAddress', 'device', 'location', 'status'];
  loginActivity: LoginActivity[] = [
    { date: '2026-05-25 09:14 AM', ipAddress: '192.168.1.***', device: 'Chrome / macOS', location: 'New York, NY', status: 'success' },
    { date: '2026-05-24 03:42 PM', ipAddress: '10.0.0.***', device: 'Safari / iOS', location: 'New York, NY', status: 'success' },
    { date: '2026-05-23 11:08 AM', ipAddress: '172.16.0.***', device: 'Firefox / Windows', location: 'Newark, NJ', status: 'failed' },
    { date: '2026-05-22 08:30 AM', ipAddress: '192.168.1.***', device: 'Chrome / macOS', location: 'New York, NY', status: 'success' },
    { date: '2026-05-20 02:15 PM', ipAddress: '10.0.0.***', device: 'Safari / iOS', location: 'Brooklyn, NY', status: 'success' }
  ];

  trustedDevices: TrustedDevice[] = [
    { id: 'dev-001', name: 'MacBook Pro', lastUsed: '2026-05-25', browser: 'Chrome 125' },
    { id: 'dev-002', name: 'iPhone 15 Pro', lastUsed: '2026-05-24', browser: 'Safari 18' },
    { id: 'dev-003', name: 'iPad Air', lastUsed: '2026-05-18', browser: 'Safari 18' }
  ];

  mfaMethods: MfaMethod[] = [
    { id: 'mfa-001', type: 'sms', value: '(***) ***-4567', isPrimary: true },
    { id: 'mfa-002', type: 'email', value: 'j***@email.com', isPrimary: false },
    { id: 'mfa-003', type: 'authenticator', value: 'Authenticator App', isPrimary: false }
  ];

  constructor(
    private authService: AuthService,
    private auditLogService: AuditLogService,
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.analyticsService.trackPageView('/profile');
    this.maskedEmail = redactEmail(this.userEmail);
    this.maskedPhone = redactPhone(this.userPhone);
  }

  togglePaperless(): void {
    this.paperlessEnabled = !this.paperlessEnabled;
    const userId = this.authService.getToken() ? 'authenticated-user' : null;
    this.auditLogService.logProfileSecurityChange(userId, 'paperless_toggle', {
      enabled: this.paperlessEnabled
    });
  }

  removeDevice(device: TrustedDevice): void {
    this.trustedDevices = this.trustedDevices.filter(d => d.id !== device.id);
    const userId = this.authService.getToken() ? 'authenticated-user' : null;
    this.auditLogService.logProfileSecurityChange(userId, 'remove_trusted_device', {
      deviceName: device.name
    });
    this.cdr.markForCheck();
  }

  signOutAllDevices(): void {
    const userId = this.authService.getToken() ? 'authenticated-user' : null;
    this.auditLogService.logProfileSecurityChange(userId, 'sign_out_all');
    this.analyticsService.trackButtonClick('sign_out_all_devices');
  }
}
