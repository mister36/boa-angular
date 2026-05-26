import { Injectable } from '@angular/core';
import { redactPii } from '@boa/shared-utils';
import { AuthService } from '@boa/auth';
import { EnvironmentConfigService } from '@boa/shared-utils';
import {
  AuditEvent,
  AuditEventType,
  AuditSeverity,
  BillPayAuditData,
  ExportAuditData,
  TransferAuditData
} from '../models/audit-event.model';

@Injectable()
export class AuditLogService {
  constructor(
    private authService: AuthService,
    private envConfig: EnvironmentConfigService
  ) {}

  logLoginAttempt(username: string, success: boolean, metadata?: Record<string, unknown>): void {
    this.emit({
      eventType: AuditEventType.LoginAttempt,
      severity: success ? AuditSeverity.Info : AuditSeverity.Warning,
      metadata: { username, success, ...metadata }
    });
  }

  logMfaResult(userId: string | null, success: boolean, metadata?: Record<string, unknown>): void {
    this.emit({
      eventType: success ? AuditEventType.MfaSuccess : AuditEventType.MfaFailure,
      severity: success ? AuditSeverity.Info : AuditSeverity.Warning,
      userId,
      metadata: { success, ...metadata }
    });
  }

  logTransferReview(userId: string | null, transferData: TransferAuditData): void {
    this.emit({
      eventType: AuditEventType.TransferReview,
      severity: AuditSeverity.Info,
      userId,
      metadata: { ...transferData } as Record<string, unknown>
    });
  }

  logTransferConfirmation(
    userId: string | null,
    transferData: TransferAuditData,
    confirmationNumber: string
  ): void {
    this.emit({
      eventType: AuditEventType.TransferConfirmation,
      severity: AuditSeverity.Critical,
      userId,
      metadata: { ...transferData, confirmationNumber } as Record<string, unknown>
    });
  }

  logBillPayConfirmation(userId: string | null, paymentData: BillPayAuditData): void {
    this.emit({
      eventType: AuditEventType.BillPayConfirmation,
      severity: AuditSeverity.Critical,
      userId,
      metadata: { ...paymentData } as Record<string, unknown>
    });
  }

  logProfileSecurityChange(
    userId: string | null,
    changeType: string,
    metadata?: Record<string, unknown>
  ): void {
    this.emit({
      eventType: AuditEventType.ProfileSecurityChange,
      severity: AuditSeverity.Critical,
      userId,
      metadata: { changeType, ...metadata }
    });
  }

  logExportTransactions(userId: string | null, exportData: ExportAuditData): void {
    this.emit({
      eventType: AuditEventType.ExportTransactions,
      severity: AuditSeverity.Info,
      userId,
      metadata: { ...exportData } as Record<string, unknown>
    });
  }

  logLogout(userId: string | null): void {
    this.emit({
      eventType: AuditEventType.Logout,
      severity: AuditSeverity.Info,
      userId,
      metadata: {}
    });
  }

  logSessionExpired(userId: string | null): void {
    this.emit({
      eventType: AuditEventType.SessionExpired,
      severity: AuditSeverity.Warning,
      userId,
      metadata: {}
    });
  }

  private emit(partial: Partial<AuditEvent> & { eventType: AuditEventType; metadata: Record<string, unknown> }): void {
    if (!this.isEnabled()) return;

    const event: AuditEvent = {
      eventType: partial.eventType,
      severity: partial.severity || AuditSeverity.Info,
      correlationId: this.authService.getCorrelationId(),
      userId: partial.userId !== undefined ? partial.userId : this.getCurrentUserId(),
      timestamp: new Date().toISOString(),
      metadata: this.redactMetadata(partial.metadata)
    };

    // Simulate sending to compliance audit backend
    console.log(
      `[BOA Audit] ${event.severity.toUpperCase()} | ${event.eventType}`,
      JSON.stringify(event, null, 2)
    );
  }

  private redactMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    return redactPii(metadata) as Record<string, unknown>;
  }

  private getCurrentUserId(): string | null {
    // Access synchronous snapshot from auth service's correlation session
    const token = this.authService.getToken();
    return token ? 'authenticated-user' : null;
  }

  private isEnabled(): boolean {
    return this.envConfig.get('auditLoggingEnabled');
  }
}
