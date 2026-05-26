// Module
export { AuthModule } from './lib/auth.module';

// Services
export { AuthService } from './lib/services/auth.service';
export { MockSsoProvider } from './lib/services/mock-sso.provider';

// Guards
export { AuthGuard } from './lib/guards/auth.guard';
export { MfaGuard } from './lib/guards/mfa.guard';
export { RoleGuard } from './lib/guards/role.guard';

// Interceptors
export { AuthTokenInterceptor } from './lib/interceptors/auth-token.interceptor';
export { CorrelationIdInterceptor } from './lib/interceptors/correlation-id.interceptor';
export { ErrorHandlingInterceptor, NormalizedHttpError } from './lib/interceptors/error-handling.interceptor';
export { SessionTimeoutInterceptor } from './lib/interceptors/session-timeout.interceptor';

// Models
export {
  AuthState,
  AuthStatus,
  AuthToken,
  LoginCredentials,
  MfaChallenge,
  MockMfaResponse,
  MockSsoResponse,
  MockTokenResponse,
  UserProfile
} from './lib/models/auth.models';
