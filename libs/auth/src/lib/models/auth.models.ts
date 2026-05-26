export enum AuthStatus {
  Unauthenticated = 'unauthenticated',
  MfaPending = 'mfa_pending',
  Authenticated = 'authenticated',
  Locked = 'locked',
  Expired = 'expired'
}

export interface AuthState {
  status: AuthStatus;
  user: UserProfile | null;
  token: AuthToken | null;
  mfaChallenge: MfaChallenge | null;
  sessionExpiresAt: number | null;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  roles: string[];
  lastLogin: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberDevice: boolean;
}

export interface MfaChallenge {
  challengeId: string;
  method: 'sms' | 'email' | 'authenticator';
  maskedDestination: string;
  expiresAt: number;
  attemptsRemaining: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  issuedAt: number;
}

export interface MockSsoResponse {
  success: boolean;
  mfaRequired: boolean;
  challenge?: MfaChallenge;
  error?: string;
  errorCode?: string;
}

export interface MockMfaResponse {
  success: boolean;
  token?: AuthToken;
  user?: UserProfile;
  error?: string;
  locked?: boolean;
  attemptsRemaining?: number;
}

export interface MockTokenResponse {
  success: boolean;
  token?: AuthToken;
  error?: string;
}
