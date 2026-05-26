import { Injectable } from '@angular/core';
import { redactPii } from '@boa/shared-utils';
import { AuthService } from '@boa/auth';
import { EnvironmentConfigService } from '@boa/shared-utils';
import {
  AnalyticsEvent,
  AnalyticsEventType,
  BillPayPayload,
  ButtonClickPayload,
  ErrorPayload,
  FormStepPayload,
  PageViewPayload,
  TransferPayload
} from '../models/analytics-event.model';

@Injectable()
export class AnalyticsService {
  private userSegment: string | null = null;

  constructor(
    private authService: AuthService,
    private envConfig: EnvironmentConfigService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.userSegment = user?.roles?.length
        ? user.roles[0]
        : null;
    });
  }

  trackPageView(routePath: string, metadata?: Partial<PageViewPayload>): void {
    if (!this.isEnabled()) return;

    this.emit(AnalyticsEventType.PageView, {
      routePath,
      ...metadata
    } as unknown as Record<string, unknown>);
  }

  trackButtonClick(label: string, metadata?: Record<string, unknown>): void {
    if (!this.isEnabled()) return;

    this.emit(AnalyticsEventType.ButtonClick, {
      label,
      metadata
    } as unknown as Record<string, unknown>);
  }

  trackFormStep(formName: string, stepIndex: number, metadata?: Record<string, unknown>): void {
    if (!this.isEnabled()) return;

    this.emit(AnalyticsEventType.FormStep, {
      formName,
      stepIndex,
      metadata
    } as unknown as Record<string, unknown>);
  }

  trackError(error: unknown, context?: string): void {
    if (!this.isEnabled()) return;

    const normalizedError = error instanceof Error ? error : new Error(String(error));

    this.emit(AnalyticsEventType.Error, {
      errorMessage: normalizedError.message,
      context,
      stackTrace: normalizedError.stack?.substring(0, 500)
    } as unknown as Record<string, unknown>);
  }

  trackCompletedTransfer(transferData: Partial<TransferPayload>): void {
    if (!this.isEnabled()) return;

    this.emit(AnalyticsEventType.TransferCompleted, transferData);
  }

  trackCompletedBillPay(paymentData: Partial<BillPayPayload>): void {
    if (!this.isEnabled()) return;

    this.emit(AnalyticsEventType.BillPayCompleted, paymentData);
  }

  private emit(eventType: AnalyticsEventType, payload: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      correlationId: this.authService.getCorrelationId(),
      userSegment: this.userSegment,
      payload: this.redactSensitiveFields(payload)
    };

    // Mock analytics SDK — logs to console simulating proprietary SDK call
    console.group(`[BOA Analytics] ${event.eventType}`);
    console.log('Event:', JSON.stringify(event, null, 2));
    console.groupEnd();
  }

  private redactSensitiveFields(payload: Record<string, unknown>): Record<string, unknown> {
    return redactPii(payload) as Record<string, unknown>;
  }

  private isEnabled(): boolean {
    return this.envConfig.get('analyticsEnabled');
  }
}
