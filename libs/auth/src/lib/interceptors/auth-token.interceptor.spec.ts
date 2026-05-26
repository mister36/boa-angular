import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthTokenInterceptor } from './auth-token.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthTokenInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
        { provide: AuthService, useValue: authService }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header when token exists', () => {
    authService.getToken.and.returnValue('test-token-abc');

    httpClient.get('/api/accounts').subscribe();

    const req = httpMock.expectOne('/api/accounts');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token-abc');
    req.flush({});
  });

  it('should not add Authorization header when no token', () => {
    authService.getToken.and.returnValue(null);

    httpClient.get('/api/accounts').subscribe();

    const req = httpMock.expectOne('/api/accounts');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should skip public endpoints - /auth/login', () => {
    authService.getToken.and.returnValue('test-token-abc');

    httpClient.post('/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should skip public endpoints - /auth/mfa', () => {
    authService.getToken.and.returnValue('test-token-abc');

    httpClient.post('/auth/mfa', {}).subscribe();

    const req = httpMock.expectOne('/auth/mfa');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should skip public endpoints - /public/', () => {
    authService.getToken.and.returnValue('test-token-abc');

    httpClient.get('/public/health').subscribe();

    const req = httpMock.expectOne('/public/health');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('should pass through request on protected endpoint without token', () => {
    authService.getToken.and.returnValue(null);

    httpClient.get('/api/transfers').subscribe();

    const req = httpMock.expectOne('/api/transfers');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
