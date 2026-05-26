import { Injectable } from '@angular/core';

export interface EnvironmentConfig {
  production: boolean;
  apiBaseUrl: string;
  authBaseUrl: string;
  analyticsEnabled: boolean;
  auditLoggingEnabled: boolean;
  sessionTimeoutMinutes: number;
  maxMfaAttempts: number;
  transferDailyLimit: number;
  featureFlagsEndpoint?: string;
}

const DEFAULT_CONFIG: EnvironmentConfig = {
  production: false,
  apiBaseUrl: '/api/v1',
  authBaseUrl: '/auth',
  analyticsEnabled: true,
  auditLoggingEnabled: true,
  sessionTimeoutMinutes: 15,
  maxMfaAttempts: 3,
  transferDailyLimit: 10000,
  featureFlagsEndpoint: '/api/v1/feature-flags'
};

@Injectable()
export class EnvironmentConfigService {
  private config: EnvironmentConfig = { ...DEFAULT_CONFIG };

  initialize(overrides?: Partial<EnvironmentConfig>): void {
    if (overrides) {
      this.config = { ...this.config, ...overrides };
    }
  }

  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  getAll(): Readonly<EnvironmentConfig> {
    return { ...this.config };
  }

  isProduction(): boolean {
    return this.config.production;
  }

  getApiUrl(path: string): string {
    return `${this.config.apiBaseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  getAuthUrl(path: string): string {
    return `${this.config.authBaseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }
}
